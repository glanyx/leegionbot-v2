import { Help, Config as CommandConfig, IExecuteArgs } from "discord.js"
import { GuildSetting } from '../../../db/models'
import { logger } from '../../../utils'

const help: Help = {
  name: "tickets",
  category: "Configuration",
  description: "Base command for Server tickets configuration. Please use subcommands.",
  usage: "help config tickets",
  example: ['help config tickets']
}

const configs: CommandConfig = {
  permissions: [
    'MANAGE_GUILD'
  ]
}

export class Tickets {
  
  public static async run({
    message
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    channel.send('Please use subcommands to configure your server.')

  }

  public static get subcommands() {
    return [Setup, RoleMention]
  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}

const setupHelp: Help = {
  name: "setup",
  category: "Configuration",
  description: "Initiates the Ticket System.",
  usage: "config tickets setup",
  example: ['config tickets setup']
}

const setupConfigs: CommandConfig = {
  permissions: [
    'MANAGE_GUILD'
  ]
}

class Setup {

  public static async run({
    message
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    const cat = await guild.channels.create('TICKETS', {
      type: 'GUILD_CATEGORY',
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: 'VIEW_CHANNEL',
        }
      ]
    })

    await guild.channels.create('ticket-logs', {
      type: 'GUILD_TEXT',
      parent: cat.id,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: 'SEND_MESSAGES',
        }
      ]
    })

    const settings = await GuildSetting.fetchByGuildId(guild.id)
    if (!settings) return channel.send('Unable to configure server at this time.')

    settings.setTicketCategoryId(cat.id).update()
    channel.send('Setup Complete!')

  }

  public static get help() {
    return setupHelp
  }

  public static get configs() {
    return setupConfigs
  }

}

const mentionHelp: Help = {
  name: "rolemention",
  category: "Configuration",
  description: "Sets a Role to mention when a new Ticket is created.",
  usage: "config tickets rolemention [rolename]",
  example: ['config tickets rolemention mods']
}

const mentionConfig: CommandConfig = {
  permissions: [
    'MANAGE_GUILD'
  ]
}

class RoleMention {

  public static async run({
    message,
    args,
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    const roleName = args.shift()
    if (!roleName) return channel.send('Please provide the name of a role!')
    
    const role = [...guild.roles.cache.values()].find(r => r.name.toLowerCase() === roleName.toLowerCase())
    if (!role) return channel.send('Unable to find a role by that name!')

    const settings = await GuildSetting.fetchByGuildId(guild.id)
    if (!settings) return channel.send('Unable to configure server at this time.')

    settings.addTicketMentionRoleIds(role.id).update()
    channel.send('Mention Roles updated!')

  }

  public static get help() {
    return mentionHelp
  }

  public static get configs() {
    return mentionConfig
  }

}