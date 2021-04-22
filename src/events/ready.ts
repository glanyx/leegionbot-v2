import { Client } from 'discord.js'
import { DBClient } from '../db'
import { Countdown, ModLog, GuildSetting } from '../db/models'
import { logger, Blacklist, CountdownTimer, MuteManager } from '../utils'

export class Ready {

  public static async execute(client: Client) {
    logger.info(`Logged in as ${client.user?.tag}!`);
  
    logger.info('Establising DB connection..')
    await DBClient.connect().then(() => {
      logger.info('Successfully connected to DB!')
    })

    logger.info('Initiating Countdown timer system..')
    new CountdownTimer(client)

    logger.info('Setting variables for individual guilds')
    await Promise.all(client.guilds.cache.map(async guild => {

      logger.info(`Now fetching for Guild ID ${guild.id}..`)

      // Word blacklist
      Blacklist.loadFromDB(guild.id)

      // Countdown Timers
      Countdown.fetchAllActive().then(({ items: countdowns }) => {
        countdowns.forEach(countdown => {
          CountdownTimer.add({ countdown })
        })
      })

    }))

    
    logger.info('Fetching active mutes..')
    const { items: mutes } = await ModLog.fetchActiveMutes()
    mutes.map(async mute => {
      const guild = client.guilds.cache.get(mute.guildId)
      if (!guild) return
      const settings = await GuildSetting.fetchByGuildId(guild.id)
      if (!settings) return
      const { mutedRoleId } = settings
      const member = guild.members.cache.get(mute.targetId)
      const role = guild.roles.cache.get(mutedRoleId)
      if (!member || !role) return
      await member.fetch()
      if (!mute.muteTime) return
      MuteManager.add(mute.id, member, role, mute.muteTime.getTime())
    })

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
      logger.info(`Invite me at: ${url}`);
    });

    logger.info(`Now listening for events..`);
  }
  
}