import { Help, IExecuteArgs, MessageEmbed, ClientUser } from "discord.js"

const help: Help = {
  name: "about",
  category: "Informational",
  description: "Displays basic information about the bot.",
  usage: "about",
  example: ['about']
}

const alias = ['abt']

export class About {

  public static async run({
    client,
    message
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    const owner = (await client.fetchApplication()).owner
    const clientUser = client.user as ClientUser

    const embed = new MessageEmbed()
      .setAuthor(clientUser.username, clientUser.avatarURL() || undefined)
      .setDescription(`Leegionbot is a private Discord Bot, custom created by <@${owner}>, especially for use by LeeandLie.`)
      .addField('Questions, suggestions or concerns?', `Please DM my owner <@${owner}>!`)

    channel.send(embed)
  }

  public static get help() {
    return help
  }

  public static get alias() {
    return alias
  }

}