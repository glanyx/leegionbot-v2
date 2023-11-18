import { Client, Message, PermissionFlagsBits } from 'discord.js'

export class PingReplyManager {

  client: Client

  constructor(client: Client) {
    this.client = client
    client.on('messageCreate', this.checkMessage)
  }

  private checkMessage = async (message: Message) => {

    const { guild, member, reference } = message

    if (!guild || !member || !reference) return

    if (reference.messageId && message.mentions.repliedUser && message.mentions.users.map(u => u.id).includes(message.mentions.repliedUser.id)) {
      const target = guild.members.cache.get(message.mentions.repliedUser.id) || await guild.members.fetch(message.mentions.repliedUser.id)

      if (target.permissions.has(PermissionFlagsBits.ManageMessages) && !member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        message.reply({
          content: `Please do not ping Moderators without reason, or their express permission!`,
          files: [
            {
              attachment: 'https://tenor.com/view/discord-reply-discord-reply-off-discord-reply-gif-22150762.gif',
              name: 'replyPing.gif'
            }
          ]
        })
      }
    }

  }

}