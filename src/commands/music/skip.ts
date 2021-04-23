import { Help, Config, IExecuteArgs } from "discord.js"
import { logger, QueueObject } from "../../utils"

const help: Help = {
  name: "skip",
  category: "Music",
  description: "Skips the currently playing song.",
  usage: "skip",
  example: [
    'skip',
  ]
}

const configs: Config = {
  permissions: [
    'SEND_MESSAGES'
  ]
}

export class Skip {

  public static async run({
    message,
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    const instance = QueueObject.fetchQueueByGuildId(guild.id)

    if (instance) {

      try{
        instance.skip()
      } catch (e) {
        channel.send(e)
        return
      }
  
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