import { Help, Config, IExecuteArgs, MessageEmbed } from "discord.js"
import { Levels } from '../../db/models'
import { levels } from '../../utils'

const help: Help = {
  name: "rank",
  category: "Informational",
  description: "Displays a User's chat rank.",
  usage: "rank",
  example: ['rank']
}

const configs: Config = {
  permissions: [
    'SEND_MESSAGES'
  ]
}

export class Rank {

  public static async run({
    message
  }: IExecuteArgs) {

    const { guild, channel, author } = message
    if (!guild) return

    const userLevel = await Levels.fetchUserData(guild.id, author.id)

    const level = userLevel ? levels.findIndex(l => l > userLevel.exp) - 1 : 0
    const totalExp = userLevel ? userLevel.exp : 0
    const prevExp = levels[level]
    const expLim = levels[level + 1]

    const remainder = totalExp - prevExp

    const embed = new MessageEmbed()
      .setAuthor({
        name: `${author.username}#${author.discriminator}`,
        iconURL: author.displayAvatarURL(),
      })
      .setTitle(`**Level ${level}** | Rank ${userLevel ? userLevel.rank : 'Unknown'}`)
      .setDescription(`${remainder} / ${expLim} XP`)
      .setTimestamp()

    channel.send({ embeds: [embed] })

  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}