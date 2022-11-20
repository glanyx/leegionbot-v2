import { Help, Config, IExecuteArgs, PermissionFlagsBits } from "discord.js"

const configs: Config = {
  permissions: [
    PermissionFlagsBits.Administrator
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
    if (!guild) return (channel as any).send('Please use this command in a server!')
    if (attachments.size === 0 || attachments.size > 1) return (channel as any).send('Please upload a single image!')

    const name = args.shift()
    if (!name) return (channel as any).send('Please provide a name!')
    const roleName = args.shift()
    if (!roleName) return (channel as any).send('Please provide the name of a role!')

    await guild.roles.fetch()
    const role = [...guild.roles.cache.values()].find(r => r.name.toLowerCase() === roleName.toLowerCase())

    if (!role) return (channel as any).send('Unable to find a role by that name!')

    const attachment = attachments.first()
    if (!attachment) return (channel as any).send('Unable to find attachment!')

    const emoji = await guild.emojis.create({
      name,
      attachment: attachment.proxyURL,
      roles: [role.id]
    })

    message.delete();

    (channel as any).send(`${emoji} created for ${role}!`)

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