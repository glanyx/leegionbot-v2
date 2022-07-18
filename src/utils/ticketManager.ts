import { Client, Message, User, Guild, TextChannel, MessageEmbed, MessageAttachment, DMChannel, GuildChannel } from 'discord.js'
import { logger, StepMessage, ResponseType } from '.'
import { TicketConversation as TicketConversationModel, GuildSetting } from '../db/models'

export class TicketManager {

  private client: Client

  constructor(client: Client) {
    this.client = client

    TicketConversation.loadAllOngoingFromDB(client)

    client.on('messageCreate', (message) => {
      if (message.author.bot) return
      if (message.channel.type !== 'DM') return
      this.processDMs(message)
    })
  }

  private processDMs = async (message: Message) => {

    const { content, attachments } = message
    
    this.getConversation(message).then(async conversation => {

      conversation.forwardToGuild(content, [...attachments.values()])

    })
    .catch(_ => {
      logger.debug('Ticket Creation Cancelled')
    })

  }

  private getConversation = async (message: Message): Promise<TicketConversation> => {
    return new Promise(async (resolve, reject) => {

      const { client } = this
      const { author, channel, content: ticketContent } = message

      if (!channel.isText()) return

      const conversation = await this.getGuildResponse(client, author, (channel as TextChannel), ticketContent).catch(e => reject(e.message))

      if (conversation) {
        conversation.setUser(author)

        if (conversation.status === ConversationStatus.ONGOING) {
          resolve(conversation)
          return
        }

        await conversation.createTicketChannel()

        await conversation.store()
        if (conversation.guild && conversation.model) {
          const guildConvos = GuildConversations.get(conversation.guild.id)
          if (guildConvos) guildConvos.conversations.set(conversation.model.id, conversation)
        }
        conversation.setOngoing()
        await conversation.createNewTicketMessage()

        resolve(conversation)

      }

    })
  }

  private getGuildResponse = async (client: Client, user: User, channel: TextChannel, content: string) => {
    
    const { items: ongoingTickets } = await TicketConversationModel.fetchOngoingForUserId(user.id)
    
    return new Promise<TicketConversation>(async (resolve, reject) => {

      let first = true
      let final = false
      let conversation

      while (!final) {

        conversation = undefined

        const guildmemberArray = await Promise.all([...client.guilds.cache.values()].map(async guild => await guild.members.fetch({ user: user.id, cache: true })))
        const sharedGuilds = new Map<string, Guild>(guildmemberArray.map(mbr => [mbr.guild.id, mbr.guild]))
    
        if (sharedGuilds.size === 0) return channel.send('No servers available to contact at this time.')
    
        const guildOptions = [...sharedGuilds.values()].map(g => { return { label: g.name, value: g.id }})

        const contactGuildId = first && ongoingTickets.length > 0 ? ongoingTickets[0].guildId : guildOptions.length === 1 ? guildOptions[0].value : await new StepMessage(client, ResponseType.LIST, {
          listOptions: guildOptions,
        })
          .setDescription('Please select a server to contact.')
          .requestUser((channel as TextChannel), user).catch((e: Error) => {
            reject(e.message)
          })

        const contactGuild = client.guilds.cache.get(`${contactGuildId}`)
    
        if (!contactGuild) return channel.send('Unable to contact server at this time. Please try again later.')

        const guildConvos = GuildConversations.get(`${contactGuildId}`)
        const existing = guildConvos && [...guildConvos.conversations.values()].find(conv => conv.user && conv.user.id === user.id)

        conversation = existing ? existing : new TicketConversation().setGuild(contactGuild)

        const confirmMessage = await new StepMessage(client, ResponseType.CHOICE)
          .setAuthor({ name: `${user.username}#${user.discriminator}`, iconURL: user.displayAvatarURL() })
          .setTitle('Preview of your message')
          .setDescription(`You are about to send a message to **${contactGuild.name}** (ID: ${contactGuild.id}). Please confirm this is the server you want to contact.\n\n**Your Message**\n${content}`)
          .requestUser((channel as TextChannel), user).catch((e: Error) => {
            reject(e.message)
          })

        first = false

        if (confirmMessage === 'decline') reject('TICKET_CANCELLED')

        final = confirmMessage === 'confirm'
      }

      if (conversation && conversation.guild && !GuildConversations.has(conversation.guild.id)) GuildConversations.set(conversation.guild.id,
        { 
          guild: conversation.guild,
          conversations: new Map<number, TicketConversation>()
        })
      if (conversation) resolve(conversation)
    })
  }

}

export enum ConversationStatus {
  PENDING = 'pending',
  ONGOING = 'ongoing',
  CLOSED = 'closed',
}

interface GuildConversation {
  guild: Guild
  conversations: Map<number, TicketConversation>
}

const GuildConversations = new Map<string, GuildConversation>()

export class TicketConversation {

  public status: ConversationStatus
  public guild?: Guild
  public channel?: TextChannel
  public user?: User
  public model?: TicketConversationModel

  constructor() {
    this.status = ConversationStatus.PENDING
  }

  public static loadAllOngoingFromDB = async (client: Client) => {

    logger.info('Fetching active Ticket Conversations')
    const { items: tickets } = await TicketConversationModel.fetchAllOngoing()

    const guildIds = tickets.map(t => t.guildId).filter((v, i, s) => s.indexOf(v) === i)

    guildIds.forEach(async id => {
      const guild = client.guilds.cache.get(id)
      if (!guild) return
      GuildConversations.set(id, {
        guild,
        conversations: new Map<number, TicketConversation>()
      })

      const gTickets = tickets.filter(t => t.guildId === guild.id)
      await Promise.all(gTickets.map(t => guild.channels.fetch(t.channelId, { cache: true })))
      await Promise.all(gTickets.map(t => client.users.fetch(t.userId, { cache: true })))
      gTickets.forEach(t => {
        const ch = guild.channels.cache.get(t.channelId)
        const user = client.users.cache.get(t.userId)
        if (!ch || !user) return
        const conv = new TicketConversation()
          .setGuild(guild)
          .setChannel(ch as TextChannel)
          .setUser(user)

        conv.status = t.status
        conv.model = t

        const guildItem = GuildConversations.get(id)
        if (!guildItem) return
        guildItem.conversations.set(conv.model.id, conv)

      })
    })

  }

  public static getChannelConversation = (channel: GuildChannel) => {

    const { guild } = channel

    const guildConvos = GuildConversations.get(guild.id)
    if (!guildConvos) return
    return [...guildConvos.conversations.values()].find(con => con.channel && con.channel.id === channel.id)

  }

  public store = async () => {
    if (!this.guild || !this.channel || !this.user) throw new Error('Unable to store model')
    const model = await TicketConversationModel.add({
      guildId: this.guild.id,
      channelId: this.channel.id,
      userId: this.user.id,
      status: this.status,
    })
    this.model = model
    return model
  }

  private updateModel = () => {
    if (!this.model) return
    this.model.setStatus(this.status)
    this.model.update()
  }

  public setGuild = (guild: Guild) => {
    this.guild = guild
    return this
  }

  public setChannel = (channel: TextChannel) => {
    this.channel = channel
    return this
  }

  public setUser = (user: User) => {
    this.user = user
    return this
  }

  public setOngoing = () => {
    this.status = ConversationStatus.ONGOING
    this.updateModel()
  }

  public setClosed = () => {
    this.status = ConversationStatus.CLOSED
    this.updateModel()
  }

  public close = (reason: string, user: User, anonymous: boolean = false) => {
    if (this.user && this.channel && this.guild && this.model) {
      const parent = this.channel.parent
      this.channel.delete()
      if (parent) {
        const logChannel = parent.children.sort((a, b) => a.createdTimestamp - b.createdTimestamp).first()

        const userCloseEmbed = new MessageEmbed()
          .setAuthor({
            name: anonymous ? this.guild.name : `${user.username}#${user.discriminator}`,
            iconURL: anonymous ? this.guild.iconURL() || undefined : user.displayAvatarURL()
          })
          .setTitle('Your Ticket has been Closed')
          .setDescription(`Thank you for contacting ${this.guild.name}`)
          .setFooter({ text: `Your Conversation with Server: ${this.guild.name}` })
          .setTimestamp()
        const logCloseEmbed = new MessageEmbed()
          .setTitle('Ticket Closed')
          .setDescription(reason)
          .addField('Ticket ID', `${this.model.id}`, true)
          .addField('Author', `${this.user}`, true)
          .addField('Closed By', `${user}`)

        this.user.send({ embeds: [userCloseEmbed] })
        if (logChannel && logChannel.type === 'GUILD_TEXT') logChannel.send({ embeds: [logCloseEmbed] })
        
      }
    }
    this.setClosed()
  }

  public createTicketChannel = async () => {

    if (!this.guild || !this.user) throw new Error('NO_GUILD')

    const settings = await GuildSetting.fetchByGuildId(this.guild.id)
    if (!settings) throw new Error('NO_GUILD_SETTINGS')

    const ch = await this.guild.channels.create(`${this.user.username}-${this.user.discriminator}`, {
      parent: settings.ticketCategoryId
    })

    this.channel = ch

    return this

  }

  public createNewTicketMessage = async () => {

    if (!this.guild || !this.model || !this.channel || !this.user) return

    const settings = await GuildSetting.fetchByGuildId(this.guild.id)
    const logChannel = this.channel.parent?.children.sort((a, b) => a.createdTimestamp - b.createdTimestamp).first()

    if (settings) await this.guild.roles.fetch()
    const mentionRoles = settings ? [...this.guild.roles.cache.values()].filter(r => settings.ticketMentionRoleIds.includes(r.id)) : []

    const newLogEmbed = new MessageEmbed()
      .setTitle('A new Ticket has been created!')
      .setDescription(`${this.channel}`)
      .addField('Ticket ID', `${this.model.id}`)
      .addField('Author', `${this.user}`)
      .setFooter({ text: `User ID: ${this.user.id} `})
      .setTimestamp()

    const newTicketEmbed = new MessageEmbed()
      .setTitle('A new Ticket has been created!')
      .setDescription(`**Ticket ID**\n${this.model.id}`)
      .setFooter({ text: `${this.user.username}#${this.user.discriminator} (ID: ${this.user.id})` })
      .setTimestamp()

    if (logChannel && logChannel.type === 'GUILD_TEXT') logChannel.send({ embeds: [newLogEmbed] })
    return this.channel.send({ content: mentionRoles.length > 0 ? `${mentionRoles.join(' ')}` : undefined, embeds: [newTicketEmbed] })

  }

  public forwardToGuild = (content: string, attachments: Array<MessageAttachment> = []) => {

    if (!this.user || !this.channel || !this.guild) throw new Error('INVALID_TICKET_CONVERSATION')

    const embed = new MessageEmbed()
      .setAuthor({
        name: `${this.user.username}#${this.user.discriminator}`,
        iconURL: this.user.displayAvatarURL()
      })
      .setFooter({
        text: `User ID ${this.user.id}`
      })
     
    this.sendMessage(this.channel, embed, content, attachments)
      .then(() => {
        if (!this.user || !this.user.dmChannel) return
        const confirmEmbed = new MessageEmbed().setAuthor({ name: `${this.user.username}#${this.user.discriminator}` })
        this.confirmMessage(this.user.dmChannel, confirmEmbed, content)
      })
      .catch(e => {
        if (!this.user || !this.user.dmChannel) return
        const failureEmbed = new MessageEmbed().setAuthor({ name: `${this.user.username}#${this.user.discriminator}` })
        this.failureMessage(this.user.dmChannel, failureEmbed, `${content}${attachments.length > 0 ? `\n**Attachments: ${attachments.length}` : ''}`)
        logger.debug(e.message)
      })
  }

  public forwardToUser = async (content: string, user: User, attachments: Array<MessageAttachment> = [], anonymous: boolean = false) => {

    if (!this.user || !this.channel || !this.guild) throw new Error('INVALID_TICKET_CONVERSATION')
    if (!this.user.dmChannel) await user.createDM()
    if (!this.user.dmChannel) throw new Error('INVALID_TICKET_CONVERSATION')

    const embed = new MessageEmbed()
      .setAuthor({
        name: anonymous ? `${this.guild.name}` : `${user.username}#${user.discriminator}`,
        iconURL: anonymous ? this.guild.iconURL() || undefined : user.displayAvatarURL()
      })
      .setFooter({
        text: `Your Conversation with Server: ${this.guild.name}`
      })

    this.sendMessage(this.user.dmChannel, embed, content, attachments)
      .then(() => {
        if (!this.channel) return
        const confirmEmbed = new MessageEmbed().setAuthor({ name: `${user.username}#${user.discriminator}${anonymous ? ' (Anonymous)' : ''}` })
        this.confirmMessage(this.channel, confirmEmbed, content)
      })
      .catch(e => {
        if (!this.channel) return
        const failureEmbed = new MessageEmbed().setAuthor({ name: `${user.username}#${user.discriminator}${anonymous ? ' (Anonymous)' : ''}` })
        this.failureMessage(this.channel, failureEmbed, `${content}${attachments.length > 0 ? `\n**Attachments: ${attachments.length}` : ''}`)
        logger.debug(e.message)
      })

  }

  private sendMessage = (channel: TextChannel | DMChannel, embed: MessageEmbed, content: string, attachments: Array<MessageAttachment>) => {

    embed
      .setTitle('New Message Received')
      .setColor('#00dbff')
      .setDescription(content)
      .setTimestamp()

    attachments.forEach((att, index) => embed.addField(`Attachment ${index + 1}`, att.url))

    return channel.send({ embeds: [embed] })

  }

  private confirmMessage = (channel: TextChannel | DMChannel, embed: MessageEmbed, content: string) => {
    embed
      .setColor('#00FF00')
      .setTitle('Message Sent!')
      .setDescription(content)
      .setTimestamp()
    channel.send({ embeds: [embed] })
  }

  private failureMessage = (channel: TextChannel | DMChannel, embed: MessageEmbed, content: string) => {
    embed
      .setColor('#FF0000')
      .setTitle('Unable to send message! Please try again later.')
      .setDescription(content)
      .setTimestamp()
    channel.send({ embeds: [embed] })
  }

}