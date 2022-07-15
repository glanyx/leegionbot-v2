import { Client, ClientUser, MessageEmbed } from 'discord.js'
import { StreamEvent, TwitchClient, TwitchManager } from '../../utils/twitch'
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
      activities: [
        {
          name: stream.title,
          type: 'STREAMING',
          url: `https://www.twitch.tv/${stream.broadcaster_login}`
        }
      ],
    })

    const channels = TwitchManager.getAnnounceChannel(stream.broadcaster_login)
    const embed = new MessageEmbed()
      .setColor('#6441a5')
      .setTitle(`${stream.display_name} just went live on Twitch!`)
      .setDescription(`**Playing ${stream.game_name}**\n${stream.title}\n\n[Watch Now!](https://www.twitch.tv/${stream.broadcaster_login})`)
      .setFooter({ text: `Via Twitch` })
      .setTimestamp()

    channels.forEach(ch => {
      ch.send({ embeds: [embed] })
    })

  }

}