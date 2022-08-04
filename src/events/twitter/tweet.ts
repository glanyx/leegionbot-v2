import { Client, TextChannel, MessageEmbed } from 'discord.js'
import { TweetEvent, TwitterClient } from '../../utils/twitter'
import { GuildSetting } from '../../db/models'

interface MultiClient {
  discordClient: Client
  twitterClient: TwitterClient
}

export class Tweet {

  public static async execute(clients: MultiClient, tweet: TweetEvent) {

    const { discordClient } = clients
    const { data, rule } = tweet

    const guild = discordClient.guilds.cache.get(rule.guildId)
    if (!guild) return

    const firstImage = data.imageUrls.shift()

    GuildSetting.fetchByGuildId(guild.id)
      .then(async setting => {
        if (!setting) return

        const channel = guild.channels.cache.get(setting.twitterAnnounceChannelId) || await guild.channels.fetch(setting.twitterAnnounceChannelId)

        const embed = new MessageEmbed()
          .setColor('#1DA1F2')
          .setTitle(`New Tweet by @${rule.from}`)
          .setDescription(`${data.text}${data.imageUrls.length > 0 ? `\n\n${data.imageUrls.map((url, i) => `[Image ${i + 1}](${url})`).join('\n')}` : ''}\n\n[View on Twitter](https://twitter.com/${rule.from}/status/${data.id})`)
          .setFooter({ text: 'Via Twitter' })
          .setTimestamp()
          .setURL(`https://twitter.com/${rule.from}`)

        if (firstImage) embed.setImage(firstImage);

        (channel as TextChannel).send({ embeds: [embed] })

      })

  }

}