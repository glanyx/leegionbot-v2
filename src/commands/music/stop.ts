import { Help, Config, IExecuteArgs } from "discord.js"
import { logger, QueueObject } from "../../utils"

const help: Help = {
  name: "stop",
  category: "Music",
  description: "",
  usage: "stop",
  example: [
    'stop',
  ]
}

const configs: Config = {
  permissions: [
    'SEND_MESSAGES'
  ]
}

export class Stop {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    const instance = QueueObject.fetchQueueByGuildId(guild.id)

    if (instance) {

      if (!instance.playing) {
        channel.send(`I'm not playing anything right now!`)
        return
      }
  
      instance.stop()
  
    } else {
      channel.send(`I'm not in a Voice Channel!`)
    }
  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}