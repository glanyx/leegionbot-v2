import { Client, ClientUser } from 'discord.js'
import { StreamEvent, TwitchClient } from '../../utils/twitch'
import { logger } from '../../utils'

interface MultiClient {
  discordClient: Client
  twitchClient: TwitchClient
}

export class GoOffline {

  public static async execute(clients: MultiClient, stream: StreamEvent) {

    logger.info(`${stream.display_name} just went offline on Twitch.`)

    const { discordClient } = clients

    const user = discordClient.user as ClientUser
    user.setPresence({
      status: 'online',
      activity: undefined
    })
  }

}