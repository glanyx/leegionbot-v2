import { Help, Config as CommandConfig, IExecuteArgs, PermissionFlagsBits } from "discord.js"
import Configs from './configs'

const help: Help = {
  name: "config",
  category: "Configuration",
  description: "Base command for Server configuration. Please use subcommands.",
  usage: "help config",
  example: ['help config']
}

const configs: CommandConfig = {
  permissions: [
    PermissionFlagsBits.ManageGuild
  ]
}

const alias = [
  'cfg'
]

export class Config {

  public static async run({
    message
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    (channel as any).send('Please use subcommands to configure your server.')

  }

  public static get subcommands() {
    return Configs
  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

  public static get alias() {
    return alias
  }

}