import { Client, Message, User, Guild, TextChannel, MessageEmbed } from 'discord.js'
import { StepMessage, ResponseType } from '.'

export class TicketManager {

  private client: Client

  constructor(client: Client) {
    this.client = client
    client.on('messageCreate', (message) => {
      if (message.author.bot) return
      if (message.channel.type !== 'DM') return
      this.processDMs(message)
    })
  }

  private processDMs = async (message: Message) => {
    
    const { client } = this
    const { author, channel, content: ticketContent, attachments } = message

    if (!channel.isText()) return

    let final = false
    const conversation = new TicketConversation()

    while (!final) {

      const guildmemberArray = await Promise.all([...client.guilds.cache.values()].map(async guild => await guild.members.fetch({ user: author.id, cache: true })))
      const sharedGuilds = new Map<string, Guild>(guildmemberArray.map(mbr => [mbr.guild.id, mbr.guild]))
  
      if (sharedGuilds.size === 0) return channel.send('No servers available to contact at this time.')
  
      const guildOptions = [...sharedGuilds.values()].map(g => { return { label: g.name, value: g.id }})
  
      const contactGuildId = guildOptions.length === 1 ? guildOptions[0].value : await new StepMessage(client, ResponseType.LIST, {
        listOptions: guildOptions,
      }).requestUser((channel as TextChannel), author)
  
      const contactGuild = client.guilds.cache.get(`${contactGuildId}`)
  
      if (!contactGuild) return channel.send('Unable to contact server at this time. Please try again later.')

      conversation.setGuild(contactGuild)

      const confirmMessage = await new StepMessage(client, ResponseType.CHOICE)
        .setAuthor({ name: `${author.username}#${author.discriminator}`, iconURL: author.displayAvatarURL() })
        .setTitle('New Message Received')
        .setDescription(ticketContent).requestUser((channel as TextChannel), author)

      if (confirmMessage === 'decline') return

      final = Boolean(confirmMessage === 'confirm')
    }

  }

}

enum ConversationStatus {
  PENDING = 'pending',
  ONGOING = 'ongoing',
  CLOSED = 'closed',
}

class TicketConversation {

  public guild?: Guild
  public status: ConversationStatus

  constructor() {
    this.status = ConversationStatus.PENDING
  }

  public store() {

  }

  public setGuild(guild: Guild) {
    this.guild = guild
  }

}

const generateServerEmbed = (content: string, user: User) => {
  return new MessageEmbed()
    .setAuthor({ name: `${user.username}#${user.discriminator}`, iconURL: user.displayAvatarURL() })
    .setTitle('New Message Received')
    .setDescription(content)
}