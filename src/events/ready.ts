import { Client } from 'discord.js'
import { DBClient } from '../db'
import { Countdown } from '../db/models'
import { logger, Blacklist, CountdownTimer, ModActions, TicketConversation } from '../utils'

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
    ModActions.loadAllMutes(client)
    ModActions.monitorMutes()

    logger.info('Fetching active Ticket Conversations')
    TicketConversation.loadAllOngoingFromDB(client)

    const url = client.generateInvite({ 
      scopes: [
        'bot',
        'applications.commands',
        'connections'
      ],
      permissions: [
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
      'MOVE_MEMBERS',
    ]})
    
    logger.info(`Invite me at: ${url}`)

    logger.info(`Now listening for events..`);
  }
  
}