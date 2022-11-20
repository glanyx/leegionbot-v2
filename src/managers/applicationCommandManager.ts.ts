import { Client, REST, Routes } from 'discord.js'
import { logger } from '../utils'
import Slashcommands from '../slashCommands'
import { CommandLevel } from '../utils/constants'

class ApplicationCommandManager {

  private client: Client
  private rest: REST
  private appId: string

  constructor(client: Client) {
    this.client = client
    if (!client.token) throw new Error('Unable to find bot token')
    if (!this.client.application) throw new Error('Unable to find application')
    this.rest = new REST({ version: '10' }).setToken(client.token)
    this.appId = this.client.application.id
  }

  public registerGlobal = async () => {
    const commands = Slashcommands.filter(acmd => acmd.level === CommandLevel.GLOBAL).map(acmd => acmd.data.toJSON())

    try {

      logger.info('Registering global application commands')

      const route: `/${string}` = Routes.applicationCommands(this.appId) as any as `/${string}`
      const data = await this.rest.put(route, {
        body: commands
      })

      logger.info(`Registered ${(data as Array<any>).length} application commands`)

    } catch (e) {
      logger.error(e)
    }
  }

  public registerGuild = async (guildId: string) => {
    const commands = Slashcommands.filter(acmd => acmd.level === CommandLevel.GUILD).map(acmd => acmd.data.toJSON())

    try {

      logger.info('Registering guild application commands')

      const route: `/${string}` = Routes.applicationGuildCommands(this.appId, guildId) as any as `/${string}`
      const data = await this.rest.put(route, {
        body: commands
      })

      logger.info(`Registered ${(data as Array<any>).length} guild application commands for guild ID ${guildId}`)

    } catch (e) {
      logger.error(e)
    }
  }

}

export default ApplicationCommandManager