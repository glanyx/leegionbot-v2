import { MessageEmbed, TextChannel, Guild } from "discord.js"
import { GuildSetting } from '../db/models'

export const modlogNotify = async (guild: Guild, content: { embed?: MessageEmbed, content?: string }, backup: TextChannel) => {
  const settings = await GuildSetting.fetchByGuildId(guild.id)
  if (settings) {
    const { modLogChannelId } = settings
    const logChannel = guild.channels.cache.get(modLogChannelId) as TextChannel
    if (logChannel) {
      await logChannel.fetch()

      logChannel.send(content)
      backup.send(content).then(msg => setTimeout(() => msg.delete(), 10000))
      return
    }
  }

  backup.send(content).then(msg => setTimeout(() => msg.delete(), 10000))
}