import { EmbedBuilder, TextChannel, Guild } from "discord.js"
import { GuildSetting } from '../db/models'

export const modlogNotify = async (guild: Guild, content: { embeds?: Array<EmbedBuilder>, content?: string }, backup: TextChannel) => {
  const settings = await GuildSetting.fetchByGuildId(guild.id)
  if (settings) {
    const { modLogChannelId } = settings
    const logChannel = guild.channels.cache.get(modLogChannelId) as TextChannel
    if (logChannel) {
      await logChannel.fetch()

      logChannel.send(content)
    }
  }

  backup.send(content).then(msg => setTimeout(() => msg.delete(), 10000))
}