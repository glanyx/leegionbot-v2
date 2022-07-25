import { Client, TextChannel } from 'discord.js'
import { GuildSetting } from '../db/models'

export class VoteManager {

  private client: Client
  private channelMap: Map<string, TextChannel>

  constructor(client: Client) {
    this.client = client
    this.channelMap = new Map<string, TextChannel>()
    this.fetchTrackers()
    this.listen()
  }

  private fetchTrackers = async () => {

    const { items: guildSettings } = await GuildSetting.fetchVoteTrackers()
    
    guildSettings.forEach(async set => {
      const guild = this.client.guilds.cache.get(set.guildId) || await this.client.guilds.fetch(set.guildId)
      await guild.channels.fetch()
      set.voteChannels.forEach(async chId => {
        const ch = guild.channels.cache.get(chId) || await guild.channels.fetch(chId)
        if (!ch) return
        this.channelMap.set(ch.id, (ch as TextChannel))
      })
    })
  }

  private listen = () => {
    this.client.on('messageCreate', (message) => {
      const { channel } = message
      if ([...this.channelMap.keys()].includes(channel.id)) message.react(':thumbsup:')
    })
  }

}