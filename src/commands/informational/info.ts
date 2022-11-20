import { Help, Config, IExecuteArgs, EmbedBuilder, PermissionFlagsBits } from "discord.js"
import { formatDiff } from '../../utils'
import os from 'os'

const help: Help = {
  name: "info",
  category: "Informational",
  description: "Displays detailed bot information.",
  usage: "info",
  example: ['info']
}

const configs: Config = {
  permissions: [
    PermissionFlagsBits.SendMessages
  ]
}

export class Info {

  public static async run({
    client,
    message
  }: IExecuteArgs) {

    const { channel } = message

    const startMeasure = cpuAverage()

    const timeout = setTimeout(() => {

      const endMeasure = cpuAverage()
      const totalDiff = endMeasure.total - startMeasure.total
      const idleDiff = endMeasure.idle - startMeasure.idle

      const embed = new EmbedBuilder()
        .setTimestamp()
        .addFields({
          name: 'Bot Version',
          value: `${process.env.VERSION}`,
          inline: true,
        }, {
          name: 'CPU Usage (%)',
          value: `${(1 - idleDiff / totalDiff).toFixed(1)}%`,
          inline: true,
        }, {
          name: 'Memory Usage',
          value: `${(Math.round(process.memoryUsage().rss) / 1024 / 1024).toFixed(1)} MB`,
          inline: true,
        }, {
          name: 'Bot Uptime',
          value: formatDiff(client.uptime || 0),
        });

      (channel as any).send({ embeds: [embed] })

      clearTimeout(timeout)
    }, 1000)
  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}

const cpuAverage = () => {
  let totalIdle = 0, totalTick = 0
  const cpus = os.cpus()

  cpus.forEach(cpu => {

    for (const type in cpu.times) {
      totalTick += (cpu.times as any)[type]
    }

    totalIdle += cpu.times.idle
  })

  return {
    idle: totalIdle / cpus.length,
    total: totalTick / cpus.length
  }
}