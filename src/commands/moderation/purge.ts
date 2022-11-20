import { Help, Config, IExecuteArgs, TextChannel, PermissionFlagsBits, ChannelType, Message } from "discord.js"
import { logger } from "../../utils"

const configs: Config = {
  permissions: [
    PermissionFlagsBits.ManageNicknames
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
      (channel as any).send('Please specify an amount of messages to delete.').then((msg: Message) => setTimeout(() => msg.delete(), 5000))
      return
    }

    const total = parseInt(args[0]) + 1
    const cycles = Math.floor(total / 100)
    const remainder = total % 100

    if (channel.type === ChannelType.GuildText) {

      for (let i = 0; i < cycles; i++) {
        (channel as any).bulkDelete(100)
      }

      (channel as any).bulkDelete(remainder)
        .then(() => (channel as any).send(`**${total - 1}** messages deleted!`)
          .then((msg: Message) => setTimeout(() => msg.delete(), 5000))
          .catch((e: Error) => {
            logger.error(e)
          })
        )
        .catch((e: Error) => {
          (channel as any).send(`Something went wrong purging ${args[0]} messages!`).then((msg: Message) => setTimeout(() => msg.delete(), 5000))
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