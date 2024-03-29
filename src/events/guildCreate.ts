import { Client, Guild } from 'discord.js'
import { GuildSetting } from '../db/models'
import { logger } from '../utils'

export class GuildCreate {

  public static async execute(client: Client, guild: Guild) {
    logger.info(`Guild Join Event | ${guild.name} [ID: ${guild.id}]`)

    client.managers.applicationCommandManager.registerGuild(guild.id)
    
    try {
      GuildSetting.add(guild.id)
    } catch (e) {
      logger.error(e)
    }
  }

}