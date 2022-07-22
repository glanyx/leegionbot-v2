import { Help, Config, IExecuteArgs, MessageButton, MessageActionRow, Role, Message } from "discord.js"
import { StepMessage, ResponseType } from '../../utils'

const configs: Config = {
  permissions: [
    'MANAGE_CHANNELS'
  ]
}

const help: Help = {
  name: "rolemenu",
  category: "Features",
  description: "",
  usage: "rolemenu",
  example: [
    'rolemenu',
  ]
}

const alias = ['menu', 'rm']

const isRole = (item: Role | undefined) : item is Role => {
  return !!item
}

export class Rolemenu {

  public static async run({
    client,
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel, author } = message

    if (!guild || !channel || channel.type !== 'GUILD_TEXT') return

    const roleMessage = new StepMessage(client, ResponseType.TEXT, {})
      .setTitle(`Rolemenu Setup`)
      .setDescription('Please enter the names of all roles you would like to add. Separate by commas.')

    const response = await roleMessage.requestUser(channel, author)

    if (typeof response === 'string') return
    const rolenames = response.text.split(',').map(t => t.trim())

    await guild.roles.fetch()

    const roles = rolenames.map(name => [...guild.roles.cache.values()].find(item => item.name.toLowerCase() === name.toLowerCase()))
    const filteredRoles = roles.filter(isRole)

    if (roles.length !== filteredRoles.length) {
      message.delete()
      response.message.delete()
      channel.send('Unable to find one or more roles. Please try again.').then(msg => setTimeout(() => msg.delete(), 5000))
      return
    }

    if (filteredRoles.length > 25) {message.delete()
      response.message.delete()
      channel.send('Maximum roles in a rolemenu is 25! Please add 25 roles or fewer.').then(msg => setTimeout(() => msg.delete(), 5000))
      return
    }

    const buttons = filteredRoles.map(r => new MessageButton()
      .setCustomId(`rolemenu-${r.id}`)
      .setLabel(r.name)
      .setStyle('PRIMARY')
    )

    const components: Array<MessageActionRow> = []

    while (buttons.length > 5) {
      const chunk = buttons.splice(0, 5)
      const row = new MessageActionRow()
        .addComponents(chunk)
      components.push(row)
    }

    const finalRow = new MessageActionRow()
      .addComponents(buttons)
    components.push(finalRow)

    await channel.send({
      content: 'Please click a button below to receive or remove the corresponding role.',
      components
    })

    channel.send('Rolemenu created.').then((msg) => setTimeout(() => msg.delete(), 3000))

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