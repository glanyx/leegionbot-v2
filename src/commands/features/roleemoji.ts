import { Help, Config, IExecuteArgs } from "discord.js"

const configs: Config = {
  permissions: [
    'ADMINISTRATOR'
  ],
}

const help: Help = {
  name: "roleemoji",
  category: "Features",
  description: "",
  usage: "roleemoji",
  example: [
    'roleemoji',
  ]
}

const alias = ['emoji', 'remoji']

export class RoleEmoji {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel, attachments } = message
    if (!guild) return channel.send('Please use this command in a server!')
    if (attachments.size === 0 || attachments.size > 1) return channel.send('Please upload a single image!')

    const name = args.shift()
    if (!name) return channel.send('Please provide a name!')
    const roleName = args.shift()
    if (!roleName) return channel.send('Please provide the name of a role!')

    await guild.roles.fetch()
    const role = [...guild.roles.cache.values()].find(r => r.name.toLowerCase() === roleName.toLowerCase())

    if (!role) return channel.send('Unable to find a role by that name!')

    const attachment = attachments.first()
    if (!attachment) return channel.send('Unable to find attachment!')

    const emoji = await guild.emojis.create(attachment.proxyURL, name, {
      roles: [role.id]
    })

    message.delete()

    channel.send(`${emoji} created for ${role}!`)

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