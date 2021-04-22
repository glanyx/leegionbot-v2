import { Command, User, Client, Message as DiscordMessage } from 'discord.js'
import { GuildSetting } from '../db/models'
import { logger, hasPerms, AutoMod, Blacklist } from '../utils'

export class Message {

  public static async execute(client: Client, message: DiscordMessage) {

    if (message.author.bot) return

    const { guild, member, channel } = message
    if (!guild || !member) return

    const owner = (await client.fetchApplication()).owner as User
    const setting = await GuildSetting.fetchByGuildId(guild.id)

    const prefix = process.env.DISCORD_PREFIX || '='

    // Allow members with manage_messages to pass through automod / blacklist
    if (!member.hasPermission('MANAGE_MESSAGES')) {
      AutoMod.add(client, member, message)
      if (message.guild) {
        if (Blacklist.compare(guild.id, message.content.startsWith(prefix) ? message.content.slice(prefix.length) : message.content)) {
          await message.delete()
          channel.send(`Please mind the language, <@${member.id}>!`).then(m => m.delete({ timeout: 5000 }))
          return
        }
      }
    }

    if (!message.content.startsWith(prefix)) return
  
    const args = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/g)

    const command = args.shift()?.toLowerCase()
  
    if (!command) return
              
    const cmd = client.commands.get(command) || client.commands.find(cmd => cmd.alias ? cmd.alias.includes(command) : false)
    
    if (!cmd) return

    const cmdArray: Array<Command> = []
    cmdArray.push(cmd)

    while (cmdArray[cmdArray.length - 1].subcommands) {

      const cur = cmdArray[cmdArray.length - 1]

      const subcommands = cur.subcommands?.map(sub => sub.help.name)

      if (!args[0] || !subcommands) break

      const subcommand = cur.subcommands?.find(sub => sub.help.name === args[0].toLowerCase()) || cur.subcommands?.find(sbcmd => sbcmd.alias ? sbcmd.alias.includes(args[0].toLowerCase()) : false)

      if (!subcommand) break
      if (!hasPerms(subcommand, member, owner)) break
      
      args.shift()
      cmdArray.push(subcommand)

    }

    const execCmd = cmdArray[cmdArray.length - 1]

    if (!(hasPerms(execCmd, member, owner))) {
      message.channel.send(`You don't have the required permissions to use this command!`)
      return
    }

    const content = args.join(' ')

    logger.info(`Command ${cmdArray.map(cmd => cmd.help.name).join(' > ')} executed by User ID: ${message.author.id}`)

    execCmd.run({
      client, message, content, args
    })
  }

}