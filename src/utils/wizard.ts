import { logger } from '.'
import { Client, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, User, TextChannel, SelectMenuBuilder, ButtonStyle, Colors, Collection } from 'discord.js'

export enum ResponseType {
  TEXT = 'text',
  BOOLEAN = 'boolean',
  CHOICE = 'choice',
  EMOTE = 'emote',
  LIST = 'list',
}

interface Option {
  label: string
  value: string
}

interface StepOptions {
  overwrites?: {
    confirmLabel?: string
    declineLabel?: string
    redoLabel?: string
  }
  listOptions?: Array<Option>
}

interface StringResponse {
  message: Message
  text: string
}

export class Wizard {

}

export class StepMessage extends EmbedBuilder {

  private timeout: number = 3000000

  private client: Client
  private responseType: ResponseType
  private actionRow: ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>

  constructor(client: Client, type: ResponseType, options?: StepOptions) {
    super()
    this.client = client
    this.responseType = type

    const components = []

    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel(options?.overwrites?.confirmLabel || 'I agree')
      .setStyle(ButtonStyle.Success)
    const declineButton = new ButtonBuilder()
      .setCustomId('decline')
      .setLabel(options?.overwrites?.declineLabel || 'I decline')
      .setStyle(ButtonStyle.Danger)
    const redoButton = new ButtonBuilder()
      .setCustomId('redo')
      .setLabel(options?.overwrites?.redoLabel || 'Change my selection')
      .setStyle(ButtonStyle.Primary)

    const selectionBox = new SelectMenuBuilder()
      .setCustomId('select')
      .setPlaceholder('Please make a selection')
      .addOptions(options?.listOptions || [])

    switch (type) {
      case ResponseType.BOOLEAN:
        components.push(confirmButton, declineButton)
        break
      case ResponseType.CHOICE:
        components.push(confirmButton, declineButton, redoButton)
        break
      case ResponseType.LIST:
        components.push(selectionBox)
        break
    }

    this.actionRow = new ActionRowBuilder<ButtonBuilder | SelectMenuBuilder>().addComponents(components)
  }

  public async requestChannel(channel: TextChannel): Promise<any> {

  }

  public async requestUser(channel: TextChannel, user?: User): Promise<string | StringResponse> {
    const message = await channel.send({ embeds: [this], components: this.actionRow.components.length > 0 ? [this.actionRow] : undefined })
    return new Promise((resolve, reject) => {

      // Set standard timeout
      setTimeout(() => {
        logger.debug(`Message Timeout | Channel ID ${channel.id} | User ID ${user ? user.id : 'None'}`)
        reject(new Error('MESSAGE_TIMEOUT'))
      }, this.timeout)

      // Interaction responses
      this.client.on('interactionCreate', interaction => {
        if (interaction.isButton()) {
          if (interaction.message.id === message.id && interaction.user === user) {
            const confirmed = interaction.customId.toLowerCase() === 'confirm'
            const redo = interaction.customId.toLowerCase() === 'redo'
            this.setColor(confirmed ? Colors.Green : redo ? Colors.Blue : Colors.Red)
            interaction.update({ embeds: [this], components: [] })
            resolve(interaction.customId.toLowerCase())
          }
        } else if (interaction.isSelectMenu()) {
          if (interaction.message.id === message.id && interaction.user === user && interaction.customId.toLowerCase() === 'select') {
            interaction.update({ embeds: [this], components: [] })
            resolve(interaction.values[0])
          }
        }
      })

      // Plain text response
      if (this.responseType === ResponseType.TEXT) {

        const filter = (m: Message) => user ? m.author.id === user.id : true

        if (channel.isTextBased()) {
          const collector = (channel as any).createMessageCollector({
            filter: filter,
            time: this.timeout,
            max: 1
          })
    
          collector.on('collect', async (m: Message) => {
            collector.stop()
            resolve({ message: message, text: m.content })
          })
    
          collector.on('end', (collected: Collection<string, Message<boolean>>) => {
            if (!collected || collected.size === 0) {
              logger.debug(`0 Items Collected | Channel ID ${channel.id} | User ID ${user ? user.id : 'None'}`)
              reject(new Error('NO_USER_RESPONSE_FOUND'))
            }
          })
        }

      }
    })
  }

}