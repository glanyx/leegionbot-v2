import { Help, Config, IExecuteArgs } from "discord.js"
import { logger, TicketConversation } from '../../utils'

interface ITicketExecuteArgs extends IExecuteArgs {
  anonymous: boolean
}

const help: Help = {
  name: "reply",
  category: "Ticket",
  description: "",
  usage: "reply",
  example: [
    'reply',
  ]
}

const configs: Config = {
  permissions: [
    'MANAGE_MESSAGES'
  ]
}

export class Reply {

  public static async run({
    anonymous,
    message,
    args,
  }: ITicketExecuteArgs) {

    const { guild, author, channel, attachments } = message
    if (!guild || channel.type !== 'GUILD_TEXT') return

    const conv = TicketConversation.getChannelConversation(channel)
    if (!conv) return channel.send('Unable to send response at this time. Please try again later.')

    conv.forwardToUser(args.join(' '), author, [...attachments.values()], anonymous)

  }

  public static get help() {
    return help
  }
  
  public static get configs() {
    return configs
  }

}

const aHelp: Help = {
  name: "areply",
  category: "Ticket",
  description: "",
  usage: "areply",
  example: [
    'areply',
  ]
}

const aConfigs: Config = {
  permissions: [
    'MANAGE_MESSAGES'
  ]
}

export class AReply {

  public static async run(props: IExecuteArgs) {

    Reply.run({
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