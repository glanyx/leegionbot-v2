import { Help, Config, IExecuteArgs } from "discord.js"
import { logger, QueueObject } from "../../utils"

const help: Help = {
  name: "play",
  category: "Music",
  description: "Plays through the current list of songs in the queue. Bot must be in a Voice Channel to use. If a URL is provided and the queue is empty, this song will play.",
  usage: "play (url)",
  example: [
    'play',
    'play https://www.youtube.com/watch?v=JqByA3ejOcg'
  ]
}

const configs: Config = {
  permissions: [
    'SEND_MESSAGES'
  ]
}

export class Play {

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
        if (instance.songs.length === 0) {
          channel.send('The song queue is empty!')
          return
        }
      }
  
      if (!instance.playing) {
        instance.play();
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