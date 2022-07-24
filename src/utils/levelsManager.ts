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

    const { guild, member } = message
    if (!guild || !member) return
    
    const item = this.memberMap.get(`${guild.id}-${member.id}`)
    if (!item) {
      const timer = setTimeout(() => {
        this.memberMap.delete(`${guild.id}-${member.id}`)
      }, TIMEFRAME)
      this.memberMap.set(`${guild.id}-${member.id}`, {
        timer,
        member,
        postCount: 0
      })
    }

    const memberItem = this.memberMap.get(`${guild.id}-${member.id}`)
    if (!memberItem) return

    const count = memberItem.postCount
    if (count < MAX_MESSAGES) {
      const min = 5 * count ** -1
      const max = 15 * count ** -1

      const rand = Math.ceil(Math.random() * (max - min) + min)
      Levels.addExp(guild.id, member.id, rand).catch(e => logger.debug(e.message))
      memberItem.postCount++
    }
    
  }

}