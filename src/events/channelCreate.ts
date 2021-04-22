import { Client, DMChannel, GuildChannel } from 'discord.js'
import { GuildSetting } from '../db/models'
import { logger } from '../utils'

export class ChannelCreate {

  public static async execute(_: Client, channel: DMChannel | GuildChannel) {

    if (channel.type !== 'dm') {

      const { guild } = (channel as GuildChannel)
      logger.debug(`New Channel on Guild ID ${guild.id}`)

      const settings = await GuildSetting.fetchByGuildId(guild.id)
      if (!settings) return

      const { mutedRoleId } = settings
      if (!mutedRoleId) return

      (channel as GuildChannel).createOverwrite(mutedRoleId, {
        SEND_MESSAGES: false,
        ATTACH_FILES: false,
        ADD_REACTIONS: false,
        SPEAK: false
      })
    }

  }
}