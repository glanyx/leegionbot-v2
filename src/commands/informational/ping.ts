import { Help, IExecuteArgs, MessageEmbed } from "discord.js"

const help: Help = {
  name: "ping",
  category: "Informational",
  description: "Pong!",
  usage: "ping",
  example: ['ping']
}

export class Ping {

  public static async run({
    client,
    message
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    const embed = new MessageEmbed()
      .setColor('#FFA500')
      .setTitle('🏓 Pong!')

    await channel.send(embed).then(msg => {
      embed
        .setColor('#00ff00')
        .setTitle(`🏓 Pong!`)
        .addField('Bot Latency', `${msg.createdTimestamp - message.createdTimestamp}ms`, true)
        .addField('API Latency', `${client.ws.ping}ms`, true)
      
        msg.edit(embed)
    })

  }

  public static get help() {
    return help
  }

}