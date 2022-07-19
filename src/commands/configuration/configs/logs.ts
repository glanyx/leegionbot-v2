import { Help, Config as CommandConfig, IExecuteArgs } from "discord.js"
import { GuildSetting } from '../../../db/models'
import { logger } from '../../../utils'

const logHelp: Help = {
  name: "logs",
  category: "Configuration",
  description: "Base command for Server logs configuration. Please use subcommands.",
  usage: "help config logs",
  example: ['help config logs']
}

const logConfigs: CommandConfig = {
  permissions: [
    'MANAGE_GUILD'
  ]
}

export class Logs {
  
  public static async run({
    message
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    channel.send('Please use subcommands to configure your server.')

  }

  public static get subcommands() {
    return [MessageLogs, MemberLogs, ModLogs]
  }

  public static get help() {
    return logHelp
  }

  public static get configs() {
    return logConfigs
  }

}

const messageLogHelp: Help = {
  name: "messages",
  category: "Configuration",
  description: "Configures which channel message logs are sent to. If no Channel ID is provided, the current channel is set.",
  usage: "config logs messages (Channel ID)",
  example: [
    'config logs messages',
    'config logs messages 1234567890'
  ]
}

const messageLogConfigs: CommandConfig = {
  permissions: [
    'MANAGE_GUILD'
  ]
}

const messageLogAlias = [
  'msg',
  'msgs'
]

class MessageLogs {
  
  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild } = message
    if (!guild) return

    let channel

    if (!args[0]) {
      channel = message.channel
    } else {
      const channelId = args[0]
      channel = guild.channels.cache.get(channelId)
      if (!channel) return message.channel.send('Unable to find a channel by that ID!')
      await channel.fetch()
    }

    if (!channel) return
    const setting = await GuildSetting.fetchByGuildId(guild.id)
    if (!setting) return
    logger.debug(`Updating message logs in Guild ID ${guild.id} to Channel ID ${channel.id}`)
    await setting.setMessageLogChannel(channel.id).update()

    message.channel.send(`Successfully set the message logs channel to <#${channel.id}>`)

  }

  public static get help() {
    return messageLogHelp
  }

  public static get configs() {
    return messageLogConfigs
  }

  public static get alias() {
    return messageLogAlias
  }

}

const memberLogHelp: Help = {
  name: "members",
  category: "Configuration",
  description: "Configures which channel member logs are sent to. If no Channel ID is provided, the current channel is set.",
  usage: "config logs members (Channel ID)",
  example: [
    'config logs members',
    'config logs members 1234567890'
  ]
}

const memberLogConfigs: CommandConfig = {
  permissions: [
    'MANAGE_GUILD'
  ]
}

const memberLogAlias = [
  'member',
  'mbr'
]

class MemberLogs {
  
  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild } = message
    if (!guild) return

    let channel

    if (!args[0]) {
      channel = message.channel
    } else {
      const channelId = args[0]
      channel = guild.channels.cache.get(channelId)
      if (!channel) return message.channel.send('Unable to find a channel by that ID!')
      await channel.fetch()
    }

    if (!channel) return
    const setting = await GuildSetting.fetchByGuildId(guild.id)
    if (!setting) return
    logger.debug(`Updating member logs in Guild ID ${guild.id} to Channel ID ${channel.id}`)
    await setting.setMemberLogChannel(channel.id).update()

    message.channel.send(`Successfully set the member logs channel to <#${channel.id}>`)

  }

  public static get help() {
    return memberLogHelp
  }

  public static get configs() {
    return memberLogConfigs
  }

  public static get alias() {
    return memberLogAlias
  }

}

const modLogHelp: Help = {
  name: "mods",
  category: "Configuration",
  description: "Configures which channel moderation logs are sent to. If no Channel ID is provided, the current channel is set.",
  usage: "config logs mods (Channel ID)",
  example: [
    'config logs mods',
    'config logs mods 1234567890'
  ]
}

const modLogConfigs: CommandConfig = {
  permissions: [
    'MANAGE_GUILD'
  ]
}

const modLogAlias = [
  'mod'
]

class ModLogs {
  
  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild } = message
    if (!guild) return

    let channel

    if (!args[0]) {
      channel = message.channel
    } else {
      const channelId = args[0]
      channel = guild.channels.cache.get(channelId)
      if (!channel) return message.channel.send('Unable to find a channel by that ID!')
      await channel.fetch()
    }

    if (!channel) return
    const setting = await GuildSetting.fetchByGuildId(guild.id)
    if (!setting) return
    logger.debug(`Updating mod logs in Guild ID ${guild.id} to Channel ID ${channel.id}`)
    await setting.setModLogChannel(channel.id).update()

    message.channel.send(`Successfully set the mod logs channel to <#${channel.id}>`)

  }

  public static get help() {
    return modLogHelp
  }

  public static get configs() {
    return modLogConfigs
  }

  public static get alias() {
    return modLogAlias
  }

}