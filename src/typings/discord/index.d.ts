import { Message, PermissionResolvable } from 'discord.js';
import { ClientRoleManager } from '../../managers'

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, Command>
    slashCommands: Collection<string, SlashCommand>
    roleManager: ClientRoleManager
  }

  export interface Command {
    help: Help
    configs?: Config
    subcommands?: Array<Command>
    alias?: Array<string>
    run: (args: IExecuteArgs) => Promise<Message | void | undefined | NodeJS.Timeout>
  }

  export interface SlashCommand {
    
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
  
}