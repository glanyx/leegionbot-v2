import { User, EmbedBuilder, Interaction, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder, CommandInteraction, UserContextMenuCommandInteraction, ChatInputCommandInteraction } from "discord.js"
import { logger } from './'

export interface IContentItem {
  content: string
  header?: string
}

interface IPaginator {
  interaction: Interaction | CommandInteraction | UserContextMenuCommandInteraction | ChatInputCommandInteraction
  title?: string
  description?: string
  user: User
  items: Array<Array<IContentItem>> | Array<Array<string>>
  currentPage: number
  useHeaders: boolean
  useOptions: boolean
  selectedOption?: number
}

interface IPaginatorArgs {
  title?: string
  description?: string
  author: User
  items: Array<IContentItem> | Array<Array<IContentItem>> | Array<string> | Array<Array<string>>
  displayCount?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  premade?: boolean
  useHeaders?: boolean
  useOptions?: boolean
  timeout?: number
  allowMultiuser?: boolean
}

export class Paginator implements IPaginator {

  interaction: Interaction | CommandInteraction | UserContextMenuCommandInteraction | ChatInputCommandInteraction
  title?: string
  description?: string
  user: User
  items: Array<Array<IContentItem>>
  currentPage: number
  useHeaders: boolean
  useOptions: boolean
  selectedOption?: number
  timeout: number
  allowMultiuser: boolean
  timer: NodeJS.Timeout

  constructor(interaction: Interaction | CommandInteraction | UserContextMenuCommandInteraction | ChatInputCommandInteraction, {
    title,
    description,
    author,
    items,
    displayCount = 5,
    premade = false,
    useHeaders = false,
    useOptions = false,
    timeout = 30000,
    allowMultiuser = false,
  }: IPaginatorArgs) {

    if (premade) {
      this.items = (items as Array<Array<IContentItem>>)
    } else {
      const paginatedItems: Array<Array<IContentItem>> = []
      while (items.length > 0) {
        paginatedItems.push((items.splice(0, displayCount) as Array<IContentItem>))
      }
      this.items = paginatedItems
    }

    this.interaction = interaction

    this.currentPage = 1
    this.useHeaders = useHeaders
    this.useOptions = useOptions
    this.title = title
    this.description = description
    this.timeout = timeout
    this.allowMultiuser = allowMultiuser

    this.user = author

    this.create()

    this.timer = setTimeout(() => {
      this.dispose()
    }, this.timeout)

    interaction.client.on('interactionCreate', this.buttonHandler)
  }

  private buttonHandler = (interaction: Interaction) => {
    if (interaction.isSelectMenu()) {
      if (!this.allowMultiuser && this.user.id !== interaction.user.id) {
        interaction.reply({ content: "Only the owner of this menu is allowed to navigate!", ephemeral: true })
        return
      }

      this.navigate(parseInt(interaction.values[0]))
      this.update(interaction)
      this.refreshTimer()
      return
    }
    if (interaction.isButton()) {
      if (!this.allowMultiuser && this.user.id !== interaction.user.id) {
        interaction.reply({ content: "Only the owner of this menu is allowed to navigate!", ephemeral: true })
        return
      }

      const name = interaction.customId
      if (this.helper[name]) {
        this.helper[name]()
        this.update(interaction)
        if (name === 'stop') return
        this.refreshTimer()
        return
      }

    }
  }

  private refreshTimer = () => {
    this.timer = setTimeout(() => {
      this.dispose()
    }, this.timeout)
  }

  private getComponents = () => {
    const first = new ButtonBuilder()
      .setCustomId('first')
      .setLabel('First')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('⏮️')

    const previous = new ButtonBuilder()
      .setCustomId('previous')
      .setLabel('Previous')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('◀️')

    if (this.currentPage === 1) {
      first.setDisabled(true)
      previous.setDisabled(true)
    }

    const next = new ButtonBuilder()
      .setCustomId('next')
      .setLabel('Next')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('▶️')

    const last = new ButtonBuilder()
      .setCustomId('last')
      .setLabel('Last')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('⏭️')

    if (this.currentPage === this.pageCount) {
      next.setDisabled(true)
      last.setDisabled(true)
    }

    const stop = new ButtonBuilder()
      .setCustomId('stop')
      .setLabel('End')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('⏹️')

    const options = [...Array(this.pageCount).keys()].map((i) => ({
      label: `${i + 1}`,
      value: `${i + 1}`,
    }))

    const skipper = new SelectMenuBuilder()
      .setCustomId('navigate')
      .setPlaceholder('Skip to page..')
      .addOptions(options)

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(first, previous, next, last, stop)
    const skipRow = new ActionRowBuilder<SelectMenuBuilder>()
      .addComponents(skipper)

    return [row, skipRow]
  }

  private create = async () => {
    if (this.interaction.isCommand() || this.interaction.isChatInputCommand() || this.interaction.isUserContextMenuCommand()) {
      if (this.interaction.deferred) {
        this.interaction.editReply({
          embeds: [this.createEmbed()],
          components: this.pageCount > 1 ? this.getComponents() : [],
        })
      } else {
        this.interaction.reply({
          embeds: [this.createEmbed()],
          components: this.pageCount > 1 ? this.getComponents() : [],
        })
      }
    } else {
      logger.debug('sample 2')
    }
  }

  private update = async (interaction: Interaction) => {

    if (interaction.isButton() && interaction.customId === 'stop') {
      clearTimeout(this.timer)
    }
    if (interaction.isButton() || interaction.isSelectMenu())
      interaction.update({
        embeds: [this.createEmbed()],
        components: this.pageCount <= 1 || interaction.customId === 'stop' ? [] : this.getComponents(),
      })
  }

  private dispose = () => {
    clearTimeout(this.timer)

    if (this.interaction.isCommand() || this.interaction.isChatInputCommand() || this.interaction.isUserContextMenuCommand())
      this.interaction.editReply({
        embeds: [this.createEmbed()],
        components: this.pageCount > 1 ? this.getComponents() : [],
      })
  }

  private first = () => {
    if (this.currentPage !== 1) {
      this.currentPage = 1
    }
  }

  private previous = () => {
    if (this.currentPage > 1) {
      this.currentPage--
    }
  }

  private next = () => {
    if (this.currentPage < this.pageCount) {
      this.currentPage++
    }
  }

  private last = () => {
    if (this.currentPage !== this.pageCount) {
      this.currentPage = this.pageCount
    }
  }

  private stop = () => { }

  private navigate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= this.pageCount) this.currentPage = pageNumber
  }

  private helper: { [K: string]: Function } = {
    next: this.next,
    previous: this.previous,
    last: this.last,
    first: this.first,
    stop: this.stop,
  }

  private get pageCount() {
    return this.items.length
  }

  private createEmbed = () => {

    const embed = new EmbedBuilder()
      .setFooter({
        text: `Page ${this.currentPage} / ${this.pageCount}`
      })

    if (this.title) {
      embed.setTitle(this.title)
    }
    if (this.description) {
      embed.setDescription(this.description)
    }

    if (!this.useHeaders && !this.useOptions) {
      const content = `
        ${this.description ? `${this.description}\n` : ''}${`${this.items[this.currentPage - 1].map(item => `${typeof (item) === 'string' ? item : item.content}`).join('')}`}
      `
      embed.setDescription(content)
    } else if (this.useHeaders) {
      this.items[this.currentPage - 1].forEach(item => {
        embed.addFields({
          name: item.header || 'Header',
          value: typeof (item) === 'string' ? item : item.content,
        })
      })
    } else if (this.useOptions) {
      this.items[this.currentPage - 1].forEach((item, index) => {
        embed.addFields({
          name: `Option ${index + 1}`,
          value: typeof (item) === 'string' ? item : item.content,
        })
      })
    }

    return embed
  }

}