import { Help, Config, IExecuteArgs, MessageEmbed, TextChannel } from 'discord.js'
import { ModLog, ModeratorAction } from '../../db/models'
import { MuteManager, handleUserMute } from '../../utils'
import { logger, modlogNotify } from "../../utils"

const configs: Config = {
  permissions: [
    'MUTE_MEMBERS'
  ]
}

const help: Help = {
  name: "mute",
  category: "Moderation",
  description: "Mutes the specified member by attaching a role. Time provided must be in minutes, hours or days (or a combination of these).",
  usage: "mute [@user | userID] [time[m | h | d]] (reason)",
  example: [
    'mute @User 20m',
    'mute 1234567890 2h',
    'mute @User 1d Be quiet for a day.',
    'mute 1234567890 1d 12h 30m Be quiet, you!'
  ]
}

export class Mute {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel, author, member: authorMember } = message
    if (!guild || !authorMember) return

    const minuteIndex = args.findIndex(arg => arg.match(/^[0-9]*m$/))
    const minutes = minuteIndex >= 0 ? parseInt(args.splice(minuteIndex, 1)[0].slice(0, -1)) : 0
    const hoursIndex = args.findIndex(arg => arg.match(/^[0-9]*h$/))
    const hours = hoursIndex >= 0 ? parseInt(args.splice(hoursIndex, 1)[0].slice(0, -1)) : 0
    const daysIndex = args.findIndex(arg => arg.match(/^[0-9]*d$/))
    const days = daysIndex >= 0 ? parseInt(args.splice(daysIndex, 1)[0].slice(0, -1)) : 0
    const sum = (minutes * 60 * 1000) + (hours * 60 * 60 * 1000) + (days * 24 * 60 * 60 * 1000)
    const muteTime = Date.now() + sum

    if (!minutes && !hours && !days) return channel.send('Please specify a duration for this mute!')

    if (!args[0]) return channel.send('Please specify a user to mute!')

    const target = message.mentions.members && message.mentions.members.first() && message.mentions.members.first() || { id: args[0] }
    const reason = args.splice(1).join(' ') || 'No reason provided'

    const member = guild.members.cache.get(target.id)
    if (!member) return message.channel.send(`Unable to find member for arguments: ${args[0]}`)

    await member.fetch()

    if (authorMember.roles.highest.position <= member.roles.highest.position && authorMember !== guild.owner) return channel.send(`You don't have the required permissions to perform this action!`)

    ModLog.fetchActiveUserMute(member.guild.id, member.id).then(async mute => {
      if (!mute) {
        try {
          const muteAction = await handleUserMute(member, reason, sum)
          if (!muteAction) return
          const { role, success } = muteAction
    
          if (!role) return
    
          const embed = new MessageEmbed()
            .setAuthor(`${member.user.username}#${member.user.discriminator} [ID: ${member.user.id}]`, member.user.avatarURL() || undefined)
            .setDescription(`This user has been muted.`)
            .addField('User', `<@${member.id}>`, true)
            .addField('Actioned by', `<@${author.id}>`, true)
            .addField('Reason', reason)
            .addField('Received DM?', `${success ? 'Yes' : 'No'}`)
            .setTimestamp()
            .setColor('#FFA500')
    
          await ModLog.storeNewAction({
            guildId: guild.id,
            userId: author.id,
            targetId: member.user.id,
            action: ModeratorAction.MUTE,
            reason,
            muteTime: new Date(muteTime)
          }).then(action => {
            embed.setTitle(`ID ${action.id} | Mute`)
            MuteManager.add(action.id, member, role, muteTime)
          }).catch(e => {
            const text = `Unable to store \`mute\` action for User ID ${member.user.id}!`
            logger.error(`${text}\n${e}`)
            return message.channel.send(text)
          })
    
          modlogNotify(guild, embed, (channel as TextChannel))
    
        } catch (e) {
          message.channel.send(`An error occured trying to mute the specified user. Please try again later.`).then(msg => msg.delete({ timeout: 5000 }))
          logger.error(e)
        }
    
      } else {
        // User is already muted
        if (mute.muteTime && mute.muteTime.getTime() > muteTime) return channel.send(`There is already a mute active for this user that lasts longer than the specified duration!`).then(msg => msg.delete({ timeout: 5000 }))
      
        // Silently overwrite existing mute
        mute.unmute().update().then(async () => {

          const muteAction = await handleUserMute(member, reason, sum)
          if (!muteAction) return
          const { role, success } = muteAction
    
          if (!role) return
    
          const embed = new MessageEmbed()
            .setAuthor(`${member.user.username}#${member.user.discriminator} [ID: ${member.user.id}]`, member.user.avatarURL() || undefined)
            .setDescription(`This user has been muted.`)
            .addField('User', `<@${member.id}>`, true)
            .addField('Actioned by', `<@${author.id}>`, true)
            .addField('Reason', reason)
            .addField('Received DM?', `${success ? 'Yes' : 'No'}`)
            .setTimestamp()
            .setColor('#FFA500')
    
          await ModLog.storeNewAction({
            guildId: guild.id,
            userId: author.id,
            targetId: member.user.id,
            action: ModeratorAction.MUTE,
            reason,
            muteTime: new Date(muteTime)
          }).then(action => {
            embed.setTitle(`ID ${action.id} | Mute`)
            MuteManager.silentDispose(mute.id)
            MuteManager.add(action.id, member, role, muteTime)
          }).catch(e => {
            const text = `Unable to store \`mute\` action for User ID ${member.user.id}!`
            logger.error(`${text}\n${e}`)
            return message.channel.send(text)
          })
    
          modlogNotify(guild, embed, (channel as TextChannel))
        })
      }
    })

  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}