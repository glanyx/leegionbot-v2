import { Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'

const desc = 'Check bot latency.'

const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription(desc)

export class Ping extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    client,
    interaction,
  }: SlashcommandInteractionArgs) {

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor(Colors.Green)
      .addFields({
        name: 'Websocket heartbeat',
        value: `${client.ws.ping}ms`
      })

    const response = await interaction.reply({ embeds: [embed], fetchReply: true })
    embed.addFields({
      name: 'Roundtrip latency',
      value: `${response.createdTimestamp - interaction.createdTimestamp}ms`,
    })

    interaction.editReply({ embeds: [embed] })

  }

}