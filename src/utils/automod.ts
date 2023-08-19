import { Client, ClientUser, Message, Guild, GuildMember, PermissionFlagsBits, ChannelType } from 'discord.js'
import { GuildSetting } from '../db/models'
import { Mute } from '.'

interface GuildMap {
  guild: Guild
  messageLimit: number
  messageTimeframe: number
  muteDuration: number
  memberMap: Map<string, MemberMessageMap>
}

interface MemberMessageMap {
  member: GuildMember
  messageMap: Map<string, MessageMap>
}

interface MessageMap {
  message: Message
  timeout: NodeJS.Timeout
}

export class SpamFilter {

  private guildMap: Map<string, GuildMap>

  constructor(client: Client) {
    this.guildMap = new Map<string, GuildMap>()
    this.processMessages(client)
  }

  private processMessages = (client: Client) => {

    client.on('messageCreate', async (message) => {

      const clientUser = client.user as ClientUser

      const { guild, member, channel } = message
      if (!guild || !member) return

      const clientMember = guild.members.cache.get(clientUser.id)
      if (!clientMember) return

      // exemption
      if (member.permissions.has(PermissionFlagsBits.ManageMessages)) return

      if (!this.guildMap.has(guild.id)) {
        await (this.refreshGuildSetting(guild))
      }

      const instance = this.guildMap.get(guild.id)
      if (!instance) return
      if (!instance.memberMap.has(member.id)) {
        instance.memberMap.set(member.id, {
          member,
          messageMap: new Map<string, MessageMap>()
        })
      }

      const memberInstance = instance.memberMap.get(member.id)
      if (!memberInstance) return

      // Add the message to the map
      const timeout = setTimeout(() => {
        memberInstance.messageMap.delete(message.id)
        if (memberInstance.messageMap.size === 0) instance.memberMap.delete(member.id)
        clearTimeout(timeout)
      }, instance.messageTimeframe)
      memberInstance.messageMap.set(message.id, { message, timeout })

      if (memberInstance.messageMap.size + 1 === instance.messageLimit + 1) {
        // Too many messages, execute mute
        const messages = [...memberInstance.messageMap.values()].map(item => item.message)
        if (channel.type === ChannelType.GuildText) (channel as any).bulkDelete(messages)
        new Mute({
          user: clientMember,
          target: member,
          reason: 'Muted by AutoMod for spam.',
          duration: instance.muteDuration,
        })
      }

    })
  }

  private fetchGuildSetting = (guildId: string) => {
    return GuildSetting.fetchByGuildId(guildId)
  }

  public refreshGuildSetting = async (guild: Guild) => {
    const settings = await this.fetchGuildSetting(guild.id)
    if (!settings) return
    this.guildMap.set(guild.id, {
      guild,
      messageLimit: settings.messageLimit,
      messageTimeframe: settings.messageTimeframe,
      muteDuration: settings.muteDuration,
      memberMap: new Map<string, MemberMessageMap>(),
    })
  }

}