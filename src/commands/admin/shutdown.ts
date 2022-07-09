import { Help, Config, IExecuteArgs, MessageReaction, User, MessageEmbed } from "discord.js"
import { logger } from '../../utils'

const help: Help = {
  name: "shutdown",
  category: "Admin",
  description: "Shuts the bot down.",
  usage: "shutdown",
  example: ['shutdown']
}

const configs: Config = {
  ownerOnly: true
}

export class Shutdown {

  public static async run({
    client,
    message
  }: IExecuteArgs) {

    const { channel, author } = message

    const embed = new MessageEmbed()
      .setTitle(`Terminate v${process.env.VERSION}?`)
      .setDescription('This will log out the bot and terminate the current process. Is this okay?')

    const embedMessage = await channel.send({ embeds: [embed] })
    await embedMessage.react('507285695484919809')
    await embedMessage.react('507287289282428962')

    
    const confirmFilter = (reaction: MessageReaction, user: User) => (reaction.emoji.id === '507285695484919809' || reaction.emoji.id === '507287289282428962') && user === author
    const confirmCollector = embedMessage.createReactionCollector({
      filter: confirmFilter,
      time: 300000,
      max: 1
    })

    confirmCollector.on('collect', async (reaction, userA) => {
      confirmCollector.stop()

      if (reaction.emoji.id === '507287289282428962') {
        embedMessage.reactions.removeAll()
        channel.send('Cancelling shutdown process..')
      } else if (reaction.emoji.id === '507285695484919809') {

        await channel.send('Terminating node process.').then(() => {

          logger.info('Destroying client and terminating node process.')
    
          client.destroy()
      
          process.exit(0)

        })
      }
    })
  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }
}