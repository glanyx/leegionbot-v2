import { Help, IExecuteArgs, EmbedBuilder, Message } from "discord.js"

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

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('🏓 Pong!')

    await (channel as any).send({ embeds: [embed] }).then((msg: Message) => {
      embed
        .setColor('#00ff00')
        .setTitle(`🏓 Pong!`)
        .addFields({
          name: 'Bot Latency',
          value: `${msg.createdTimestamp - message.createdTimestamp}ms`,
          inline: true,
        }, {
          name: 'API Latency',
          value: `${client.ws.ping}ms`,
          inline: true,
        })

      msg.edit({ embeds: [embed] })
    })

  }

  public static get help() {
    return help
  }

}