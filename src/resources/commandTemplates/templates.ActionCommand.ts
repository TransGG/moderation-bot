import type { CommandInteraction, GuildMember, Interaction, Message, User } from 'discord.js';
import { SlashCommandBooleanOption, SlashCommandStringOption, SlashCommandUserOption } from '@discordjs/builders';
import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v10';
import { ResponsiveSlashCommandSubcommandBuilder } from '@interactionHandling/commandBuilders.js';
import type InteractionHandler from '@interactionHandling/interactionHandler.js';
import COLLECTIONS from '@database/collections.js';
import EMBEDS from '../embeds.js';
import { getRules, getSnowflakeMap } from '@utils.js';

function getBasicOptions(interaction: CommandInteraction) {
  const DELETE_MESSAGE = interaction.options.getBoolean('delete-message', false) ?? undefined;
  const ACTION = interaction.options.getString('action', true);
  const REASON = interaction.options.getString('reason', true);
  const PRIVATE_NOTES = interaction.options.getString('private-notes', false);
  const RULE = JSON.parse(interaction.options.getString('rule', false)
    ?? 'null') as number[] | null ?? undefined;

  return {
    DELETE_MESSAGE,
    ACTION,
    REASON,
    PRIVATE_NOTES,
    RULE
  }
}

async function validateDuration(interaction: CommandInteraction): Promise<[boolean, number | undefined]> {
  // duration must be specific only if the action is a timeout
  const ACTION = interaction.options.getString('action', true);
  if (ACTION !== 'timeout' && ACTION !== 'ban') return [true, undefined];

  const INPUT = interaction.options.getString('duration', false) ?? undefined;
  if (!INPUT)
    if (interaction.options.getString('action', true) === 'ban') return [true, 0];
    else {
      await interaction.followUp({ content: 'Timeout duration must be specified', ephemeral: true });
      return [false, undefined];
    }

  if (!/^(?: *\d+[DHMS] *)+$/i.test(INPUT)) {
    await interaction.followUp({
      content: 'Invalid duration format, example: `1h 30m 10s`\nMatch the regex: `/^(?: *\d+[HMS] *)+$/i`',
      ephemeral: true
    });
    return [false, undefined];
  }

  let duration = 0;
  if (INPUT)
    for (const TIME of <RegExpMatchArray>INPUT.match(/\d+[DHMS]/gi)) {
      const TIME_GROUP = <{ [key in 'amount' | 'unit']: string; }>TIME.match(/(?<amount>\d+)(?<unit>[DHMS])/i)?.groups;
      switch (TIME_GROUP.unit.toUpperCase()) {
        case 'D':
          duration += Number(TIME_GROUP.amount) * 86400000;
          break;
        case 'H':
          duration += Number(TIME_GROUP.amount) * 3600000;
          break;
        case 'M':
          duration += Number(TIME_GROUP.amount) * 60000;
          break;
        case 'S':
          duration += Number(TIME_GROUP.amount) * 1000;
          break;
      }
    }

  if (
    ACTION === 'ban' &&
    (
      ((duration /= 86400000) % 1) !== 0 ||
      duration > 7 ||
      duration < 0
    )
  ) {
    await interaction.followUp({
      content: 'Ban duration must be between 1 and 7 days without hours, minutes, or seconds',
      ephemeral: true
    });
    return [false, undefined];
  }

  return [true, duration];
}

export default class ActionCommand extends ResponsiveSlashCommandSubcommandBuilder {
  private readonly type: 'user' | 'message';

  static readonly actions: [
    [APIApplicationCommandOptionChoice<string>, (member: GuildMember, reason: string) => Promise<boolean>],
    [APIApplicationCommandOptionChoice<string>, (member: GuildMember) => Promise<boolean>],
    [APIApplicationCommandOptionChoice<string>, (member: GuildMember, reason: string, duration?: number) => Promise<boolean>],
    [APIApplicationCommandOptionChoice<string>, (member: GuildMember, reason: string) => Promise<boolean>],
    [APIApplicationCommandOptionChoice<string>, (member: GuildMember, reason: string, days?: number) => Promise<boolean>]
  ] = [
      [{
        name: 'Verify',
	value: 'verify'
      }, async (member, reason) => {
        if (!member.manageable) return false;
        const SNOWFLAKE_MAP = await getSnowflakeMap();
        return !!await member.roles.add(SNOWFLAKE_MAP.Verified_Role, reason);
      }],
      [{
        name: 'Warn',
        value: 'warn'
      }, async member => {
        if (!member.manageable) return false;
        return true;
      }],
      [{
        name: 'Timeout',
        value: 'timeout'
      }, async (member, reason, duration) => {
        if (!member.moderatable) return false;
        return !!await member.timeout(duration ?? null, reason);
      }],
      [{
        name: 'Kick',
        value: 'kick'
      }, async (member, reason) => {
        if (!member.kickable) return false;
        return !!await member.kick(reason);
      }],

      [{
        name: 'Ban',
        value: 'ban'
      }, async (member, reason, days = 0) => {
        if (!member.bannable) return false;
        // FIXME: `days` option not working..?
        return !!await member.ban({ reason, days });
      }]
    ];

  public constructor(type: 'user' | 'message') {
    super();
    this.type = type;
    (type === 'user' ?
      this.addUserParameters() :
      this.addMessageParameters()
    ).addBaseParameters();
  }

  override readonly response =
    async (interaction: Interaction, _interactionHandler: InteractionHandler, command: this): Promise<any> => {
      if (!interaction.isCommand()) return;
      await interaction.deferReply({ ephemeral: true });

      const SNOWFLAKE_MAP = await getSnowflakeMap();

      // TODO: https://discord.com/channels/@me/960632564912115763/981297877131333642
      // get basic options
      const {
        DELETE_MESSAGE,
        ACTION,
        REASON,
        PRIVATE_NOTES,
        RULE
      } = getBasicOptions(interaction);

      const [IS_VALID_DURATION, DURATION] = await validateDuration(interaction);
      if (!IS_VALID_DURATION) return;

      let message: Message | undefined;
      if (command.type === 'message')
        try {
          message = await interaction.channel
            ?.messages.fetch(interaction.options.getString('message-id', true));
        } finally {
          if (!message)
            return await interaction.followUp({ content: 'Message not found', ephemeral: true });
        }

      const USER = message ?
        message.author :
        interaction.options.getUser('user', true);

      // TODO: banning users that are not in the server
      let member: GuildMember | undefined;
      try {
        member = await interaction.guild?.members.fetch(USER.id);
      } finally {
        if (!member) {
          if (ACTION === "ban") {
            try {
              const bannedUser = await interaction.guild?.members.ban(USER.id, { reason: REASON, days: DURATION ?? 0 })
              await COLLECTIONS.UserLog.newModLog(
                interaction.user.id,
                USER,
                ACTION,
                REASON,
                RULE,
                PRIVATE_NOTES ?? undefined,
                DURATION,
                message
              )
              return await interaction.followUp({ content: `Banned out-of-server member ${typeof bannedUser === "object" ? `${(bannedUser as User).tag} (${bannedUser.id})` : bannedUser}` });
            } catch (e) {
              console.log(`Failed to ban a user: ${e}`);
              return await interaction.followUp({ content: 'I couldn\'t ban that user, check that you provided the right ID', ephemeral: true })
            }
          }
          return await interaction.followUp({ content: 'User not found in this server', ephemeral: true })
        }
      }

      if (member.roles.cache.hasAny(...SNOWFLAKE_MAP.Staff_Roles))
        return await interaction.followUp({
          content: 'You cannot take action on staff members',
          ephemeral: true
        });

      if (!await ActionCommand.actions.find(action => action[0].value === ACTION)?.[1](
        member,
        REASON,
        DURATION
      )) return await interaction.followUp({
        content: 'You cannot take action on members with higher permission than this bot',
        ephemeral: true
      });

      if (DELETE_MESSAGE && message?.deletable) message.delete();

      const LOG = await COLLECTIONS.UserLog.newModLog(
        interaction.user.id,
        USER,
        ACTION,
        REASON,
        RULE,
        PRIVATE_NOTES ?? undefined,
        DURATION,
        message
      )

      try {
        await (await USER.createDM()).send({
          embeds: [await EMBEDS.moderationNotice(LOG)]
        });
      } catch {
        return await interaction.followUp({
          content: 'Could not send the notice to this user, they likely have their DMs disabled',
          ephemeral: true
        });
      }
      return await interaction.followUp({ content: 'Notice sent', ephemeral: true });
    };

  private addUserParameters() {
    return this
      .addUserOption(new SlashCommandUserOption()
        .setName('user')
        .setDescription('The user to take action on')
        .setRequired(true)
      )
  }

  private addMessageParameters() {
    return this
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName('delete-message')
        .setDescription('Whether to delete the specified message')
        .setRequired(true)
      )
      .addStringOption(new SlashCommandStringOption()
        .setName('message-id')
        .setDescription('The message to take action on')
        .setRequired(true)
      )
  }

  private async addBaseParameters() {
    return this
      .addStringOption(new SlashCommandStringOption()
        .setName('action')
        .setDescription('The action to take')
        .addChoices(...ActionCommand.actions.map(action => action[0]))
        .setRequired(true)
      )
      .addStringOption(new SlashCommandStringOption()
        .setName('reason')
        .setDescription('The reason for the action')
        .setRequired(true)
      )
      .addStringOption(new SlashCommandStringOption()
        .setName('rule')
        .setDescription('The rule to apply')
        .addChoices(...await (async () => {
          const RULES: APIApplicationCommandOptionChoice<string>[] = [];
          (await getRules()).forEach((rule, i) => {
            if (!rule.active) return;
            RULES.push({ name: `${rule.index}. ${rule.shortDesc}`, value: JSON.stringify([i]) });

            // FIXME: extended rules exceed 25 choices limit
            //rule.extended?.forEach((extended, j) => {
            //  if (!extended.active) return;
            //  RULES.push({name: `${rule.index}.${extended.index}. ${extended.shortDesc}`, value: `${i}.${j}`});
            //});
          });

          return RULES;
        })())
        .setRequired(true)
      )
      .addStringOption(new SlashCommandStringOption()
        .setName('duration')
        .setDescription('Duration of the timeout, if the action is a timeout')
        .setRequired(false)
      )
      .addStringOption(new SlashCommandStringOption()
        .setName('private-notes')
        .setDescription('Private notes to add')
        .setRequired(false)
      );
  }
}
