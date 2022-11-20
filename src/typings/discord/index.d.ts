import { Message, PermissionResolvable } from 'discord.js';
import { ClientRoleManager, ApplicationCommandManager as ACManager, TicketManager } from '../../managers'
import { CommandLevel } from '../../utils'

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, Command>
    roleManager: ClientRoleManager
    managers: BotManagers
  }

  export interface Command {
    help: Help
    configs?: Config
    subcommands?: Array<Command>
    alias?: Array<string>
    run: (args: IExecuteArgs) => Promise<Message | void | undefined | NodeJS.Timeout>
  }

  export abstract class SlashCommand {
    static description: string
    static data: SlashCommandBuilder
    static level: CommandLevel
    static async run: (args: SlashArgs) => Promise<Message | void | undefined>
  }

  export interface Help {
    name: string
    category: string
    description: string
    usage: string
    example: Array<string>
  }

  export interface Config {
    permissions?: Array<PermissionResolvable>
    ownerOnly?: boolean
  }

  export interface IExecuteArgs {
    client: Client
    message: Message
    content: string
    args: Array<string>
  }

  export interface BotManagers {
    applicationCommandManager: ACManager
    ticketManager: TicketManager
  }

}