import { Help, IExecuteArgs, EmbedBuilder, ClientUser, User, OAuth2Scopes, PermissionFlagsBits } from "discord.js"

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

    const app = client.application
    if (!app) return
    await app.fetch()
    const owner = app.owner as User
    const clientUser = client.user as ClientUser


    const url = client.generateInvite({
      scopes: [
        OAuth2Scopes.Bot,
        OAuth2Scopes.ApplicationsCommands,
        OAuth2Scopes.Connections,
      ],
      permissions: [
        PermissionFlagsBits.Administrator,
        PermissionFlagsBits.ManageGuild,
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.BanMembers,
        PermissionFlagsBits.ChangeNickname,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.MuteMembers,
        PermissionFlagsBits.DeafenMembers,
        PermissionFlagsBits.MoveMembers,
      ]
    })

    const embed = new EmbedBuilder()
      .setAuthor({
        name: clientUser.username,
        iconURL: clientUser.avatarURL() || undefined,
      })
      .setDescription(`LeegionBot is a Discord Bot especially created for the LeeandLie Discord server, by <@${owner}>. Do you want LeegionBot to help manage your server? You can invite the bot [here](${url})!`)
      .addFields({
        name: 'Questions, suggestions or concerns?',
        value: `Please DM my owner <@${owner}>!`,
      });

    (channel as any).send({ embeds: [embed] })

  }

  public static get help() {
    return help
  }

  public static get alias() {
    return alias
  }

}