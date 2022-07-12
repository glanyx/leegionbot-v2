import { logger } from '.'
import { Client, Message, MessageEmbed, MessageActionRow, MessageButton, User, TextChannel, MessageSelectMenu } from 'discord.js'

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

export class StepMessage extends MessageEmbed {

  private timeout: number = 3000000

  private client: Client
  private responseType!: ResponseType
  private actionRow: MessageActionRow

  constructor(client: Client, type: ResponseType, options?: StepOptions) {
    super()
    this.client = client

    const components = []

    const confirmButton = new MessageButton()
      .setCustomId('confirm')
      .setLabel(options?.overwrites?.confirmLabel || 'I agree')
      .setStyle('SUCCESS')
    const declineButton = new MessageButton()
      .setCustomId('decline')
      .setLabel(options?.overwrites?.declineLabel || 'I decline')
      .setStyle('DANGER')
    const redoButton = new MessageButton()
      .setCustomId('redo')
      .setLabel(options?.overwrites?.redoLabel || 'Change my selection')
      .setStyle('PRIMARY')

    const selectionBox = new MessageSelectMenu()
      .setCustomId('select')
      .setPlaceholder('Please make a selection')
      .addOptions(options?.listOptions || [])

    switch (type) {
      case ResponseType.BOOLEAN:
        components.push(confirmButton, declineButton)
      case ResponseType.CHOICE:
        components.push(confirmButton, declineButton, redoButton)
      case ResponseType.LIST:
        components.push(selectionBox)
    }

    this.actionRow = new MessageActionRow().addComponents(components)
  }

  public async requestChannel(channel: TextChannel): Promise<any> {

  }

  public async requestUser(channel: TextChannel, user?: User): Promise<string | StringResponse> {
    const message = await channel.send({ embeds: [this], components: [this.actionRow] })
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
            this.setColor(confirmed ? 'GREEN' : redo ? 'BLUE' : 'RED')
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

        const filter = (m: Message) => user ? m.author === user : true

        const collector = channel.createMessageCollector({
          filter: filter,
          time: this.timeout,
          max: 1
        })
  
        collector.on('collect', async m => {
          collector.stop()
          resolve({ message: message, text: m.content })
        })
  
        collector.on('end', collected => {
          if (!collected || collected.size === 0) {
            logger.debug(`0 Items Collected | Channel ID ${channel.id} | User ID ${user ? user.id : 'None'}`)
            reject(new Error('NO_USER_RESPONSE_FOUND'))
          }
        })

      }
    })
  }

}