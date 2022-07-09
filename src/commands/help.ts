import { User, Help as CommandHelp, Command, IExecuteArgs, Util, Formatters } from "discord.js"
import { Commands } from './'
import { hasPerms } from "../utils";

const help: CommandHelp = {
  name: "help",
  category: "System",
  description: "Displays all available commands.",
  usage: "help [command]",
  example: [
    'help',
    'help user',
    'help ping',
    'help warn list'
  ]
};

export class Help {

  public static async run({
    client,
    message,
    content,
    args
  }: IExecuteArgs) {

    const { member, guild } = message
    if (!guild || !member) return

    const commands = client.commands;
    const commandList = [...commands.keys()]

    // standalone command
    if (!content) {
      const longest = commandList.reduce(
        (long: number, str: string) => Math.max(long, str.length),
        0
      );

      let output = `= Command List =\n\n[Use ${process.env.DISCORD_PREFIX}help <commandname> for details]\n`;

      const app = client.application
      if (!app) return
      await app.fetch()
      const owner = app.owner as User

      const sorted = Commands
        .filter(cmd => hasPerms(cmd, member, owner))
        .sort((p, c) =>
          p.help.category > c.help.category
            ? 1
            : p.help.name > c.help.name && p.help.category === c.help.category
            ? 1
            : -1
        )

      let curCategory: string
      sorted.forEach(c => {
        const category = c.help.category;
        if (curCategory !== category) {
          output += `\u200b\n= ${category} =\n`;
          curCategory = category;
        }
        output += ` ${process.env.DISCORD_PREFIX}${c.help.name}${" ".repeat(
          (longest - c.help.name.length)
        )} :: ${c.help.description}\n`;
      });

      const chunks = Util.splitMessage(output, { char: '\u200b' })
      chunks.forEach(content => message.channel.send(Formatters.codeBlock('asciidoc', content)))

    } else {

      let i = 0
      const commandArray: Array<Command> = []
      const command = Commands.find(command => command.help.name.toLowerCase() === args[0].toLowerCase()) || (Commands as Array<Command>).find(cmd => cmd.alias ? cmd.alias.includes(args[0].toLowerCase()) : false)

      if (!command) {
        message.channel.send(`Unable to find command \`${args[0]}\`!`)
        return
      }

      i++
      commandArray.push(command)

      while (args[i]) {

        const cur = commandArray[commandArray.length - 1]
        const subcommand = cur.subcommands?.find(sub => sub.help.name === args[i]) || cur.subcommands?.find(sbcmd => sbcmd.alias ? sbcmd.alias.includes(args[0].toLowerCase()) : false)

        if (!subcommand) {
          message.channel.send(`Unable to find subcommand \`${args[i]}\` for command \`${commandArray.map(cmd => cmd.help.name).join(' > ')}\`!`)
          return
        }

        commandArray.push(subcommand)
        i++
      }

      const cmd = commandArray[commandArray.length - 1]

      const content = `= ${commandArray.map(cmd => cmd.help.name).join(' | ')} =\n${cmd.help.description}\nUsage:: ${cmd.help.usage}${cmd.subcommands ? `\nSubcommands:: ${cmd.subcommands.map(s => s.help.name).join(', ')}` : ''}\nExample::\n${cmd.help.example?.join('\n')}`
      message.channel.send(Formatters.codeBlock('asciidoc', content))
    }
  }

  public static get help() {
    return help
  }
}