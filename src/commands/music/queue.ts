import { Help, Config, IExecuteArgs } from "discord.js"
import { logger, QueueObject } from "../../utils"

const help: Help = {
  name: "queue",
  category: "Music",
  description: "Adds the URL for this song to the queue.",
  usage: "queue [url]",
  example: [
    'queue https://www.youtube.com/watch?v=JqByA3ejOcg',
  ]
}

const configs: Config = {
  permissions: [
    'SEND_MESSAGES'
  ]
}

export class Queue {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    const instance = QueueObject.fetchQueueByGuildId(guild.id)

    if (instance) {

      if (args) {
        try{
          await instance.addSong(args[0])
        } catch (e) {
          channel.send(e)
          return
        }
      } else {
        channel.send(`You must provide a URL!`)
      }
  
    } else {
      channel.send(`I'm not in a Voice Channel! Use \`${process.env.DISCORD_PREFIX}join\` so I can join your channel!`)
    }
  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}