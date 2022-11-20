import { ChannelType, Client, DMChannel, GuildChannel, TextChannel } from 'discord.js'
import { GuildSetting } from '../db/models'
import { logger } from '../utils'

export class ChannelCreate {

  public static async execute(_: Client, channel: DMChannel | GuildChannel) {

    if (channel.type === ChannelType.GuildText) {

      const { guild } = channel
      logger.debug(`New Channel on Guild ID ${guild.id}`)

      const settings = await GuildSetting.fetchByGuildId(guild.id)
      if (!settings) return

      const { mutedRoleId } = settings
      if (!mutedRoleId) return

      channel.permissionOverwrites.create(mutedRoleId, {
        SendMessages: false,
        AttachFiles: false,
        AddReactions: false,
        Speak: false
      })
    }

  }
}