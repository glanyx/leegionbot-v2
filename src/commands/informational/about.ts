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

  
    await client.generateInvite({ permissions: [
      'ADMINISTRATOR',
      'MANAGE_GUILD',
      'MANAGE_ROLES',
      'MANAGE_CHANNELS',
      'KICK_MEMBERS',
      'BAN_MEMBERS',
      'CHANGE_NICKNAME',
      'MANAGE_NICKNAMES',
      'VIEW_CHANNEL',
      'SEND_MESSAGES',
      'MANAGE_MESSAGES',
      'EMBED_LINKS',
      'ATTACH_FILES',
      'READ_MESSAGE_HISTORY',
      'USE_EXTERNAL_EMOJIS',
      'ADD_REACTIONS',
      'MUTE_MEMBERS',
      'DEAFEN_MEMBERS',
      'MOVE_MEMBERS'
    ]}).then(url => {

      const embed = new MessageEmbed()
        .setAuthor(clientUser.username, clientUser.avatarURL() || undefined)
        .setDescription(`LeegionBot is a Discord Bot especially created for the LeeandLie Discord server, by <@${owner}>. Do you want LeegionBot to help manage your server? You can invite the bot [here](${url})!`)
        .addField('Questions, suggestions or concerns?', `Please DM my owner <@${owner}>!`)
  
      channel.send(embed)

    })
  }

  public static get help() {
    return help
  }

  public static get alias() {
    return alias
  }

}