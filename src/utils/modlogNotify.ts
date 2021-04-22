import { MessageEmbed, TextChannel, Guild } from "discord.js"
import { GuildSetting } from '../db/models'

export const modlogNotify = async (guild: Guild, content: MessageEmbed | string, backup: TextChannel) => {
  const settings = await GuildSetting.fetchByGuildId(guild.id)
  if (settings) {
    const { modLogChannelId } = settings
    const logChannel = guild.channels.cache.get(modLogChannelId) as TextChannel
    if (logChannel) {
      await logChannel.fetch()

      logChannel.send(content)
      backup.send(content).then(msg => msg.delete({ timeout: 10000 }))
      return
    }
  }

  backup.send(content).then(msg => msg.delete({ timeout: 10000 }))
}