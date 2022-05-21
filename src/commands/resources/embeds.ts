import { MessageEmbed, User } from "discord.js";

const EMBEDS = {
  moderationLogs(user: User) {
    return new MessageEmbed()
      .setAuthor({ name: 'Logs for', iconURL: user.displayAvatarURL() })
      .setDescription(`> <@${user.id}>`);;
  }
}

export default EMBEDS;