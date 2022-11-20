import { Help, Config, IExecuteArgs, EmbedBuilder, GuildMember, TextChannel } from "discord.js"
import { logger } from '../../utils'

const help: Help = {
  name: "avatar",
  category: "Informational",
  description: "Displays a user's avatar.",
  usage: "avatar (@user | userID)",
  example: [
    'avatar',
    'avatar @User',
    'avatar 1234567890'
  ]
}

const configs: Config = {

}

export class Avatar {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, member, channel } = message
    if (!guild || !member) return

    if (args.length > 0) {
      args.forEach(async arg => {
        let foundMember
        if (arg.match(/^<@[0-9]*>$/g)) {
          foundMember = guild.members.cache.get(arg.substring(2, arg.length - 1))
        } else if (arg.match(/^<@![0-9]*>$/g)) {
          foundMember = guild.members.cache.get(arg.substring(3, arg.length - 1))
        } else {
          foundMember = await guild.members.fetch(arg).catch(() => {
            logger.debug(`Unable to find member for arguments ${arg} in Guild ID ${guild.id}`)
          })
        }
        if (!foundMember) return (channel as any).send(`Unable to find member for arguments ${arg}`)
        sendEmbed(foundMember, (channel as TextChannel))
      })
    } else {
      sendEmbed(member, (channel as TextChannel))
    }

  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}

const sendEmbed = (member: GuildMember, channel: TextChannel) => {

  const defaultImage = 'https://discord.com/assets/6debd47ed13483642cf09e832ed0bc1b.png'

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${member.user.username}#${member.user.discriminator}`
    })
    .setImage(member.user.avatarURL({ size: 256, extension: 'png' }) || defaultImage)
    .setFooter({ text: `${member.user.username} | ${member.user.id}` })
    .setTimestamp();

  (channel as any).send({ embeds: [embed] })

}
