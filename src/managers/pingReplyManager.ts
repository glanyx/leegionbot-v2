import { Client, Message, PermissionFlagsBits } from 'discord.js'

export class PingReplyManager {

  client: Client

  constructor(client: Client) {
    this.client = client
    client.on('messageCreate', this.checkMessage)
  }

  private checkMessage = async (message: Message) => {

    const { channel, member } = message

    if (!member) return

    if (message.reference && message.reference.messageId) {
      const ref = channel.messages.cache.get(message.reference.messageId) || await channel.messages.fetch(message.reference.messageId)

      if (ref.member && ref.member.permissions.has(PermissionFlagsBits.ManageMessages) && !member.permissions.has(PermissionFlagsBits.ManageMessages)) {
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