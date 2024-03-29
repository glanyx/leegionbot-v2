import { Help, Config, IExecuteArgs, ButtonBuilder, ActionRowBuilder, PermissionFlagsBits, ChannelType, ButtonStyle, Message } from "discord.js"
import { StepMessage, ResponseType } from '../../utils'

const configs: Config = {
  permissions: [
    PermissionFlagsBits.ManageChannels
  ]
}

const help: Help = {
  name: "rolegate",
  category: "Features",
  description: "",
  usage: "rolegate",
  example: [
    'rolegate',
  ]
}

const alias = ['gate', 'rg']

export class Rolegate {

  public static async run({
    client,
    message,
  }: IExecuteArgs) {

    const { guild, channel, author } = message

    if (!guild || !channel || channel.type !== ChannelType.GuildText) return

    const roleMessage = new StepMessage(client, ResponseType.TEXT, {})
      .setTitle(`Rolegate Setup`)
      .setDescription('Please enter the name of the role you would like to add.')

    const response = await roleMessage.requestUser(channel, author)

    if (typeof response === 'string') return
    const { text: rolename } = response

    await guild.roles.fetch()

    const role = [...guild.roles.cache.values()].find(item => item.name.toLowerCase() === rolename.toLowerCase())

    if (!role) {
      message.delete()
      response.message.delete();
      (channel as any).send('Unable to find a role by that name. Please re-execute the command to try again.').then((msg: Message) => setTimeout(() => msg.delete(), 5000))
      return
    }

    const roleButton = new ButtonBuilder()
      .setCustomId(`rolegate-${role.id}`)
      .setLabel('I agree')
      .setStyle(ButtonStyle.Success)

    const components = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(roleButton)

    await channel.send({
      content: 'Please press the button below to agree to the rules and gain access to the server.',
      components: [components]
    })

    channel.send('Rolegate created.').then((msg) => setTimeout(() => msg.delete(), 3000))

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