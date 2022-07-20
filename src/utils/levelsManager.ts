import { Client, Message, GuildMember } from 'discord.js'
import { logger } from '.'
import { Levels } from '../db/models'

const MAX_MESSAGES = 5
const TIMEFRAME = 60000

interface MemberTimer {
  timer: NodeJS.Timeout,
  member: GuildMember
  postCount: number
}

export class LevelsManager {

  private client: Client
  private memberMap: Map<string, MemberTimer>

  constructor(client: Client) {
    this.client = client
    this.memberMap = new Map<string, MemberTimer>()

    client.on('messageCreate', (message) => {
      if (message.author.bot) return
      if (message.channel.type !== 'GUILD_TEXT') return
      this.processMessage(message)
    })
  }

  private processMessage = async (message: Message) => {

    const { guild, member, author } = message
    if (!guild || !member) return
    
    const item = this.memberMap.get(`${guild.id}-${author.id}`)
    if (!item) {
      const timer = setTimeout(() => {
        this.memberMap.delete(`${guild.id}-${author.id}`)
      }, TIMEFRAME)
      this.memberMap.set(`${guild.id}-${author.id}`, {
        timer,
        member,
        postCount: 0
      })
    }

    const memberItem = this.memberMap.get(`${guild.id}-${author.id}`)
    if (!memberItem) return

    const count = memberItem.postCount
    if (count < MAX_MESSAGES) {
      if (count === 0) {
        Levels.addExp(guild.id, author.id, 10)
      } else {
        Levels.addExp(guild.id, author.id, 1)
      }
      memberItem.postCount++
    }
    
  }

}