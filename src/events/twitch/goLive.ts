import { Client, ClientUser } from 'discord.js'
import { StreamEvent, TwitchClient } from '../../utils/twitch'
import { logger } from '../../utils'

interface MultiClient {
  discordClient: Client
  twitchClient: TwitchClient
}

export class GoLive {

  public static async execute(clients: MultiClient, stream: StreamEvent) {

    logger.info(`${stream.display_name} just went live on Twitch!`)

    const { discordClient } = clients

    const user = discordClient.user as ClientUser
    user.setPresence({
      activity: {
        name: stream.title,
        type: 'STREAMING',
        url: `https://www.twitch.tv/${stream.broadcaster_login}`
      }
    })
  }

}