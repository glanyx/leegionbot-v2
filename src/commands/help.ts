import { User, Help as CommandHelp, Command, IExecuteArgs } from "discord.js"
import Commands from './'
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
    const commandList = commands.keyArray();

    // standalone command
    if (!content) {
      const longest = commandList.reduce(
        (long: number, str: string) => Math.max(long, str.length),
        0
      );

      let output = `= Command List =\n\n[Use ${process.env.DISCORD_PREFIX}help <commandname> for details]\n`;

      const owner = (await client.fetchApplication()).owner as User

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
      message.channel.send(output, {
        code: "asciidoc",
        split: { char: "\u200b" }
      })
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

      message.channel.send(
        `= ${commandArray.map(cmd => cmd.help.name).join(' | ')} =\n${cmd.help.description}\nUsage:: ${cmd.help.usage}${cmd.subcommands ? `\nSubcommands:: ${cmd.subcommands.map(s => s.help.name).join(', ')}` : ''}\nExample::\n${cmd.help.example?.join('\n')}`,
        { code: "asciidoc" }
      );
    }
  }

  public static get help() {
    return help
  }
}