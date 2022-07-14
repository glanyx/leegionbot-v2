import { Help, Config, IExecuteArgs } from "discord.js"
import { logger, TicketConversation } from '../../utils'

interface ITicketExecuteArgs extends IExecuteArgs {
  anonymous: boolean
}

const help: Help = {
  name: "close",
  category: "Ticket",
  description: "",
  usage: "close",
  example: [
    'close',
  ]
}

const configs: Config = {
  permissions: [
    'MANAGE_MESSAGES'
  ]
}

export class Close {

  public static async run({
    anonymous,
    message,
  }: ITicketExecuteArgs) {

    const { guild, author, channel, content } = message
    if (!guild || channel.type !== 'GUILD_TEXT') return

    const conv = TicketConversation.getChannelConversation(channel)
    if (!conv) return channel.send('Unable to close at this time. Please try again later.')

    conv.close(content, author, anonymous)

  }

  public static get help() {
    return help
  }
  
  public static get configs() {
    return configs
  }

}

const aHelp: Help = {
  name: "aclose",
  category: "Ticket",
  description: "",
  usage: "aclose",
  example: [
    'aclose',
  ]
}

const aConfigs: Config = {
  permissions: [
    'MANAGE_MESSAGES'
  ]
}

export class AClose {

  public static async run(props: IExecuteArgs) {

    Close.run({
      anonymous: true,
      ...props
    })
    
  }

  public static get help() {
    return aHelp
  }
  
  public static get configs() {
    return aConfigs
  }

}