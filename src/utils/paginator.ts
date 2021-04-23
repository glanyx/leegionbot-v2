import { User, DMChannel, TextChannel, NewsChannel, Message, MessageEmbed, MessageReaction } from "discord.js";
import { ReactionOptions } from './constants'
import logger from "./logger";

const ReactionNavigation = [
  '⏮️',
  '◀️',
  '▶️',
  '⏭️',
  '⏹️',
]

export interface IContentItem {
  content: string
  header?: string
}

interface IPaginator {
  title?: string
  description?: string
  message?: Message
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
  channel: DMChannel | TextChannel | NewsChannel
  author: User
  items: Array<IContentItem> | Array<Array<IContentItem>> | Array<string> | Array<Array<string>>
  displayCount?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  premade?: boolean
  useHeaders?: boolean
  useOptions?: boolean
  timeout?: number
}

export class Paginator implements IPaginator {

  title?: string
  description?: string
  message?: Message
  user: User
  items: Array<Array<IContentItem>>
  currentPage: number
  useHeaders: boolean
  useOptions: boolean
  selectedOption?: number
  timeout: number

  constructor({
    title,
    description,
    channel,
    author,
    items,
    displayCount = 5,
    premade = false,
    useHeaders = false,
    useOptions = false,
    timeout = 30000
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

    this.currentPage = 1
    this.useHeaders = useHeaders
    this.useOptions = useOptions
    this.title = title
    this.description = description
    this.timeout = timeout

    this.user = author

    this.create(channel).then(message => {
      this.message = message
      this.addReactions()
    })
  }

  private async create(channel: DMChannel | TextChannel | NewsChannel) {
    return channel.send(this.createEmbed())
  }

  private next() {
    if (this.currentPage < this.pageCount) {
      this.currentPage++
      this.message?.edit(this.createEmbed())
    }
  }

  private previous() {
    if (this.currentPage > 1) {
      this.currentPage--
      this.message?.edit(this.createEmbed())
    }
  }

  private last() {
    if (this.currentPage !== this.pageCount) {
      this.currentPage = this.pageCount
      this.message?.edit(this.createEmbed())
    }
  }

  private first() {
    if (this.currentPage !== 1) {
      this.currentPage = 1
      this.message?.edit(this.createEmbed())
    }
  }

  private get pageCount() {
    return this.items.length
  }

  private createEmbed() {

    const embed = new MessageEmbed()
      .setFooter(`Page ${this.currentPage} / ${this.pageCount}`)

    if (this.title) {
      embed.setTitle(this.title)
    }
    if (this.description) {
      embed.setDescription(this.description)
    }
  
    if (!this.useHeaders && !this.useOptions) {
      const descriptionString = `${this.description ? `${this.description}\n` : ''}${this.items[this.currentPage - 1].map(item => typeof(item) === 'string' ? item : item.content).join('\n\n')}`
      embed.setDescription(descriptionString)
    } else if (this.useHeaders) {
      this.items[this.currentPage - 1].forEach(item => {
        embed.addField(item.header, typeof(item) === 'string' ? item : item.content)
      })
    } else if (this.useOptions) {
      this.items[this.currentPage - 1].forEach((item, index) => {
        embed.addField(`Option ${index + 1}`, typeof(item) === 'string' ? item : item.content)
      })
    }

    return embed
  }

  private async addReactions() {
    if (this.currentPage > 1) {
      await this.message?.react('⏮️')
      await this.message?.react('◀️')
    }
    if (this.currentPage < this.pageCount) {
      await this.message?.react('▶️')
      await this.message?.react('⏭️')
    }
    if (this.pageCount > 1) {
      await this.message?.react('⏹️')
    }
    if (this.useOptions) {
      await Promise.all(this.items[this.currentPage - 1].map(async (_, index) => {
        await this.message?.react(ReactionOptions[index])
      }))
    }

    this.createCollector()
  }

  private async clearReactions() {
    try {
      if (this.message?.channel.type !== 'dm') await this.message?.reactions.removeAll()
    } catch (e) {
      logger.error(e)
    }
  }

  private createCollector() {

    const filter = (reaction : MessageReaction, user: User) => [...ReactionOptions, ...ReactionNavigation].includes(reaction.emoji.name) && user.id === this.user.id

    const collector = this.message?.createReactionCollector(filter, {
      time: this.timeout,
      maxEmojis: 1,
    })

    collector?.on('collect', async reaction => {

      await this.clearReactions()

      if (ReactionNavigation.includes(reaction.emoji.name)) {
        switch (reaction.emoji.name) {
          case '⏮️':
            this.first()
            break
          case '◀️':
            this.previous()
            break
          case '▶️':
            this.next()
            break
          case '⏭️':
            this.last()
            break
          case '⏹️':
            return
          default:
            break
        }
      } else if (ReactionOptions.includes(reaction.emoji.name)) {
        const index = ReactionOptions.findIndex(option => option === reaction.emoji.name)
        this.selectedOption = this.items.reduce((acc, cur, index) => {
          if (index < this.currentPage - 1) {
            return acc + cur.length
          }
          return acc
        }, 0) + index
        return
      }

      await this.addReactions()
    })

    collector?.on('end', collected => {
      this.clearReactions()
      if (collected.size === 0) this.selectedOption = -1
    })
  }

  public async getOptionResponse(): Promise<number> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.selectedOption !== undefined) {
          clearInterval(interval)
          resolve(this.selectedOption)
        }
      }, 250)
    })
  }

}