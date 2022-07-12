import { Client, GuildMember, TextChannel, MessageEmbed } from 'discord.js'
import { GuildSetting, ModLog, ModeratorAction } from '../db/models'
import { logger, format } from '../utils'

export class GuildMemberAdd {

  public static async execute(client: Client, member: GuildMember) {

    const { guild } = member

    logger.info(`New Member: ${member.user.id} on Guild ${guild.id}`)

    // Fetch settings for this guild
    const settings = await GuildSetting.fetchByGuildId(guild.id)
    if (!settings) return
    const { memberLogChannelId, mutedRoleId } = settings
    const { items: actions } = await ModLog.fetchByUserId(guild.id, member.id, ModeratorAction.MUTE)

    // If member has active mute, re-add the Muted role configured for the guild
    if (actions.filter(action => action.muteActive === true).length > 0) {
      if (mutedRoleId) {
        const role = guild.roles.cache.get(mutedRoleId)
        if (role) {
          member.roles.add(role).catch(e => {
            logger.debug(`Unable to assign Muted Role ID ${role.id} to User ID ${member.id}\n${e.message}`)
          })
        }
      }
    }

    // Send member join message to configured channel
    if (memberLogChannelId) {
      const channel = member.guild.channels.cache.get(memberLogChannelId)

      if (channel) {
        await channel.fetch()

        const embed = new MessageEmbed()
          .setTitle('Member Joined')
          .setDescription(`${member}`)
          .setAuthor({
            name: `${member.user.username}#${member.user.discriminator}`,
            iconURL: member.user.displayAvatarURL()
          })
          .setThumbnail(member.user.displayAvatarURL())
          .setFooter({ text: `User ID: ${member.user.id}` })
          .setTimestamp()
          .setColor('#00FF00')
          .addField('Using Discord Since', format(member.user.createdAt))

        if (channel.type === 'GUILD_TEXT') {
          (channel as TextChannel).send({ embeds: [embed] })
        }
        
      }
    }

  }

}