import { Client, GuildMember, GuildChannel, Attachment, DMChannel, EmbedBuilder, ThreadChannel, Colors, ChannelType, Guild, ButtonStyle, ActionRowBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ModalActionRowComponentBuilder, ModalSubmitInteraction } from 'discord.js'
import { Ticket as TicketModel, TicketMessage } from '../db/models'
import { logger } from '../utils'
import { ButtonBuilder } from '@discordjs/builders'

enum Source {
  GUILD = 'guild',
  MEMBER = 'member'
}

export class TicketManager {

  private guildMap: Map<string, Map<string, Ticket>>
  private client: Client

  constructor(client: Client) {
    this.guildMap = new Map<string, Map<string, Ticket>>()
    this.client = client

    client.on('interactionCreate', interaction => {

      if (interaction.isButton()) {
        const args = interaction.customId.split('-')
        const cmd = args.shift()
        if (cmd?.toLowerCase() !== 'ticket') return

        this.displayModal(interaction, args)
      }

      if (interaction.isModalSubmit()) {
        if (!interaction.customId.startsWith('ticketmodal')) return
        this.respondToModal(interaction)
      }
    })
  }

  public addGuild = (guildId: string) => {
    if (!this.guildMap.has(guildId)) this.guildMap.set(guildId, new Map<string, Ticket>())
    return this.guildMap.get(guildId)
  }

  public getTicketByMember = (member: GuildMember) => {
    const { guild, user } = member
    return this.guildMap.get(guild.id)?.get(user.id)
  }

  public getTicketByChannel = (channel: GuildChannel | ThreadChannel) => {
    const { guild } = channel
    const guildTickets = this.guildMap.get(guild.id)
    if (!guildTickets) return
    return [...guildTickets.values()].find(t => t.channel.id === channel.id)
  }

  public ticketSetup = async (member: GuildMember) => {
    const { guild } = member
    const parent = this.getParent(guild)
    if (!parent) throw new Error('INVALID_PARENT')

    const ch = parent.type === ChannelType.GuildForum
      ? await parent.threads.create({
        name: `${member.user.username}-${member.user.discriminator}`,
        message: {
          content: 'A new Ticket has been created!',
        }
      })
      : await guild.channels.create({
        name: `${member.user.username}-${member.user.discriminator}`,
        parent: parent.id
      })

    return this.createTicket(member, ch)
  }

  public createTicket = async (member: GuildMember, channel: GuildChannel | ThreadChannel, model?: TicketModel) => {
    const { id: guildId } = member.guild
    const ticket = new Ticket(this, member, channel, model)
    if (!model) await ticket.initialize()
    const guildMap = this.addGuild(guildId)
    if (!guildMap) throw new Error('MAP_FETCH_ERROR')
    guildMap.set(member.id, ticket)
    return ticket
  }

  public clearTicket = (guildId: string, memberId: string) => {
    const tickets = this.guildMap.get(guildId)
    if (!tickets) return
    tickets.delete(memberId)
    if (tickets.size === 0) this.guildMap.delete(guildId)
  }

  private getParent = (guild: Guild) => {
    return [...guild.channels.cache.values()].find(ch => ch.name.toLowerCase() === 'tickets')
  }

  private displayModal = async (interaction: ButtonInteraction, args: Array<string>) => {

    const modal = new ModalBuilder()
      .setCustomId(`ticketmodal-${args.join('-')}`)
      .setTitle('Respond to your ticket')

    const response = new TextInputBuilder()
      .setCustomId(`ticketresponse`)
      .setLabel('Your Response')
      .setPlaceholder('Enter your response here')
      .setMaxLength(1000)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)

    modal.addComponents(new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(response))

    await interaction.showModal(modal)
  }

  private respondToModal = async (interaction: ModalSubmitInteraction) => {

    await interaction.deferReply()
    const args = interaction.customId.split('-')
    args.shift()

    const failureEmbed = new EmbedBuilder()
      .setTitle('Unable to deliver message')
      .setColor(Colors.Red)
      .setDescription('Unable to send your response at this time. Please try again later.')

    const responseType = args.shift()
    const guildId = args.shift()
    const destinationId = args.shift()
    if (!responseType || !guildId || !destinationId) return interaction.editReply({ embeds: [failureEmbed] })

    const guild = this.client.guilds.cache.get(guildId)
    if (!guild) return interaction.editReply({ embeds: [failureEmbed] })

    if (responseType === Source.MEMBER) {
      const member = guild.members.cache.get(destinationId) || await guild.members.fetch(destinationId)
      if (!member) return interaction.editReply({ embeds: [failureEmbed] })
      const sourceMember = guild.members.cache.get(interaction.user.id) || await guild.members.fetch(interaction.user.id)

      const ticket = this.getTicketByMember(member)
      if (!ticket) return interaction.editReply({ embeds: [failureEmbed] })
      await ticket.forwardToMember({ user: sourceMember, text: interaction.fields.getTextInputValue('ticketresponse'), anonymous: true })
    } else {
      const ch = guild.channels.cache.get(destinationId) || await guild.channels.fetch(destinationId)
      if (!ch) return interaction.editReply({ embeds: [failureEmbed] })

      const ticket = this.getTicketByChannel(ch)
      if (!ticket) return interaction.editReply({ embeds: [failureEmbed] })
      await ticket.forwardToGuild({ text: interaction.fields.getTextInputValue('ticketresponse') })
    }

    const embed = new EmbedBuilder()
      .setTitle('Message Sent!')
      .setColor(Colors.Green)
      .setDescription(interaction.fields.getTextInputValue('ticketresponse'))

    interaction.editReply({ embeds: [embed] })
  }

}

interface IMessageArgs {
  user: GuildMember
  text?: string
  attachment?: Attachment
  anonymous?: boolean
}

interface IForwardMessageArgs extends IMessageArgs {
  channel: GuildChannel | ThreadChannel | DMChannel
  source: Source
}

interface ICloseArgs {
  user: GuildMember
  reason?: string
  anonymous?: boolean
}

class Ticket {

  member: GuildMember
  channel: GuildChannel | ThreadChannel
  manager: TicketManager
  model!: TicketModel

  constructor(manager: TicketManager, member: GuildMember, channel: GuildChannel | ThreadChannel, model?: TicketModel) {
    this.manager = manager
    this.member = member
    this.channel = channel
    if (model) this.model = model
  }

  private openedEmbed = () => {
    return new EmbedBuilder()
      .setColor(Colors.Green)
      .setTitle('A new Ticket has been created!')
      .setDescription(`${this.channel}`)
      .setFooter({ text: `User ID: ${this.member.id}` })
      .setTimestamp()
      .addFields({
        name: 'Ticket ID',
        value: `${this.model.guildTicketId}`,
        inline: true,
      }, {
        name: 'Author',
        value: `${this.member}`,
        inline: true,
      })
  }

  private closedEmbed = (user: GuildMember, reason: string, received: boolean) => {
    return new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle('Ticket Closed')
      .setDescription(reason)
      .setFooter({ text: `User ID: ${this.member.id}` })
      .setTimestamp()
      .addFields({
        name: 'Ticket ID',
        value: `${this.model.guildTicketId}`,
        inline: true,
      }, {
        name: 'Author',
        value: `${this.member}`,
        inline: true,
      }, {
        name: 'Closed by',
        value: `${user}`,
        inline: true,
      }, {
        name: 'Message received?',
        value: received ? 'Yes' : 'No',
      })
  }

  private instructionsEmbed = () => {
    const everyoneRole = this.member.guild.roles.everyone
    const roles = [...this.member.roles.cache.values()].filter(r => !r.name.includes('⁣') && r.id !== everyoneRole.id)
    return new EmbedBuilder()
      .setColor(Colors.Blue)
      .setTitle('A new Ticket has been created!')
      .setDescription(
        `A new ticket has been opened!\n
        Anything you type in this channel will not be sent to the user unless you use a reply command, thus you may discuss amongst each other or ping Staff directly in this channel if you feel their intervention is required.
        If you feel you are able to handle this ticket, please type a quick message stating this, so others are aware not to answer it too. (Example: I've got this one!)\n
        Please use the \`/reply\` and \`/close\` commands to interact with this ticket.`
      )
      .addFields({
        name: 'User',
        value: `${this.member}`,
      }, {
        name: 'Roles',
        value: roles.length > 0 ? `${roles.map(r => `${r}`).join('\n')}` : '*None*'
      }, {
        name: 'Ticket ID',
        value: `${this.model.guildTicketId}`,
      })
      .setTimestamp()
  }

  public initialize = async () => {
    this.model = await TicketModel.storeNew({
      guildId: this.member.guild.id,
      channelId: this.channel.id,
      memberId: this.member.id,
    })
    await this.postCreate()
  }

  private postCreate = async () => {
    const logsChannel = this.getLogsChannel()
    const ch = this.channel
    if (logsChannel && (logsChannel.type === ChannelType.GuildText || logsChannel.type === ChannelType.PublicThread || logsChannel.type === ChannelType.PrivateThread)) (logsChannel as any).send({ embeds: [this.openedEmbed()] })
    if (ch.isTextBased()) (ch as any).send({ embeds: [this.instructionsEmbed()] })
  }

  public close = async ({
    user,
    reason = 'No reason provided',
    anonymous = false,
  }: ICloseArgs) => {

    const logsChannel = this.getLogsChannel()

    const ch = this.member.dmChannel || await this.member.createDM()
    const { guild, id: memberId } = this.member
    this.forward({
      user,
      text: `This ticket has been closed. Thank you for contacting ${guild.name}.`,
      anonymous,
      channel: ch,
      source: Source.MEMBER
    }).then(_ => {
      if (logsChannel && (logsChannel.type === ChannelType.GuildText || logsChannel.type === ChannelType.PublicThread || logsChannel.type === ChannelType.PrivateThread)) (logsChannel as any).send({ embeds: [this.closedEmbed(user, reason, true)] })
    }).catch(e => {
      logger.debug(e.message)
      if (logsChannel && (logsChannel.type === ChannelType.GuildText || logsChannel.type === ChannelType.PublicThread || logsChannel.type === ChannelType.PrivateThread)) (logsChannel as any).send({ embeds: [this.closedEmbed(user, reason, false)] })
    })
    this.model
      .setActive(false)
      .setClosedAt(new Date())
      .setReason(reason)
      .update()
    this.manager.clearTicket(guild.id, memberId)
  }

  public forwardToGuild = ({
    text,
    attachment,
    anonymous = false,
  }: Omit<IMessageArgs, 'user'>) => {
    return this.forward({ user: this.member, text, attachment, anonymous, channel: this.channel, source: Source.MEMBER }).catch(e => {
      throw new Error('UNDELIVERED')
    })
  }

  public forwardToMember = async ({
    user,
    text,
    attachment,
    anonymous = false,
  }: IMessageArgs) => {
    const ch = this.member.dmChannel || await this.member.createDM()
    return this.forward({ user, text, attachment, anonymous, channel: ch, source: Source.GUILD }).catch(e => {
      throw new Error('UNDELIVERED')
    })
  }

  private forward = ({
    user,
    text,
    attachment,
    anonymous,
    channel,
    source,
  }: IForwardMessageArgs) => {

    const respondButton = new ButtonBuilder()
      .setCustomId(`ticket-${source}-${this.member.guild.id}-${source === Source.MEMBER ? `${this.member.id}` : `${this.channel.id}`}`)
      .setLabel('Reply')
      .setStyle(ButtonStyle.Primary)
    const actionRow = new ActionRowBuilder()
      .addComponents(respondButton)

    if (!channel.isTextBased()) throw new Error('INVALID_CHANNEL_TYPE')

    TicketMessage.storeNew({
      conversationId: this.model.id,
      senderId: user.id,
      text,
      attachmentUrl: attachment?.url
    })

    const embed = new EmbedBuilder()
      .setTitle('New Message Received')
      .setColor(Colors.Blue)
      .setAuthor({
        name: user.id === this.member.id
          ? `${this.member.user.username}#${this.member.user.discriminator}${this.member.nickname ? ` (Nickname: ${this.member.nickname})` : ''}`
          : anonymous
            ? user.guild.name
            : `${user.user.username}#${user.user.discriminator}${user.nickname ? ` (Nickname: ${user.nickname})` : ''}`
      })

    if (text) embed.setDescription(text)

    return (channel as any).send({
      embeds: [embed],
      components: [actionRow],
      files: attachment ? [attachment] : []
    }).catch(e => {
      logger.debug(e.message)
      throw new Error('UNDELIVERED')
    })
  }

  private getParent = () => {
    return [...this.member.guild.channels.cache.values()].find(ch => ch.name.toLowerCase() === 'tickets')
  }

  public getLogsChannel = () => {
    const { guild } = this.member
    const parent = this.getParent()
    if (!parent) throw new Error('INVALID_PARENT')
    return [...guild.channels.cache.values()].find(ch => (parent.type === ChannelType.GuildForum && ch.name.toLowerCase() === 'ticket logs') || ch.name.toLowerCase() === 'ticket-logs')
  }

}