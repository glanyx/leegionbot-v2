import { Help, Config as CommandConfig, IExecuteArgs, PermissionFlagsBits, ChannelType } from "discord.js"
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
    PermissionFlagsBits.ManageGuild
  ]
}

export class Tickets {

  public static async run({
    message
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    (channel as any).send('Please use subcommands to configure your server.')

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
    PermissionFlagsBits.ManageGuild
  ]
}

class Setup {

  public static async run({
    message
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    const cat = await guild.channels.create({
      name: 'TICKETS',
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: PermissionFlagsBits.ViewChannel,
        }
      ]
    })

    await guild.channels.create({
      name: 'ticket-logs',
      type: ChannelType.GuildText,
      parent: cat.id,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: PermissionFlagsBits.SendMessages,
        }
      ]
    })

    const settings = await GuildSetting.fetchByGuildId(guild.id)
    if (!settings) return (channel as any).send('Unable to configure server at this time.')

    settings.setTicketCategoryId(cat.id).update();
    (channel as any).send('Setup Complete!')

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
    PermissionFlagsBits.ManageGuild
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
    if (!roleName) return (channel as any).send('Please provide the name of a role!')

    const role = [...guild.roles.cache.values()].find(r => r.name.toLowerCase() === roleName.toLowerCase())
    if (!role) return (channel as any).send('Unable to find a role by that name!')

    const settings = await GuildSetting.fetchByGuildId(guild.id)
    if (!settings) return (channel as any).send('Unable to configure server at this time.')

    settings.addTicketMentionRoleIds(role.id).update();
    (channel as any).send('Mention Roles updated!')

  }

  public static get help() {
    return mentionHelp
  }

  public static get configs() {
    return mentionConfig
  }

}