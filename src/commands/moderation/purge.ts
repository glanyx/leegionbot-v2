import { Help, Config, IExecuteArgs, TextChannel } from "discord.js"
import { logger } from "../../utils"

const configs: Config = {
  permissions: [
    'MANAGE_NICKNAMES'
  ]
}

const help: Help = {
  name: "purge",
  category: "Moderation",
  description: "Purges a specified number of messages in the current channel.",
  usage: "purge [number]",
  example: [
    'purge 10',
    'purge 50',
  ]
}

export class Purge {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    if (!args[0]) {
      channel.send('Please specify an amount of messages to delete.').then(msg => setTimeout(() => msg.delete(), 5000))
      return
    }

    const total = parseInt(args[0]) + 1
    const cycles = Math.floor(total / 100)
    const remainder = total % 100

    if (channel.type === 'GUILD_TEXT') {

      for (let i = 0; i < cycles; i++) {
        (channel as TextChannel).bulkDelete(100)
      }

      (channel as TextChannel).bulkDelete(remainder)
        .then(() => channel.send(`**${total - 1}** messages deleted!`)
          .then(msg => setTimeout(() => msg.delete(), 5000))
          .catch(e => {
            logger.error(e)
          })
        )
        .catch(e => {
          channel.send(`Something went wrong purging ${args[0]} messages!`).then(msg => setTimeout(() => msg.delete(), 5000))
          logger.error(e)
        })

    }
  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}