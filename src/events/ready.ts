import { Client } from 'discord.js'
import { ActivityType, OAuth2Scopes, PermissionFlagsBits } from 'discord-api-types/v10'
import { DBClient } from '../db'
import { Countdown, Ticket, ModLog } from '../db/models'
import { logger, Blacklist, CountdownTimer, TwitchManager, ModAction } from '../utils'
import { VoteManager, ApplicationCommandManager, TicketManager } from '../managers'

export class Ready {

  public static async execute(client: Client) {
    logger.info(`Logged in as ${client.user?.tag}!`)

    client.managers = {
      applicationCommandManager: new ApplicationCommandManager(client),
      ticketManager: new TicketManager(client),
    }
    client.managers.applicationCommandManager.registerGlobal()

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

      ModLog.fetchActiveMutes(guild.id).then(({ items: mutes }) => {
        mutes.forEach(async mute => {
          const user = guild.members.cache.get(mute.userId) || await guild.members.fetch(mute.userId)
          const target = guild.members.cache.get(mute.targetId) || await guild.members.fetch(mute.targetId)
          if (!user || !target || !mute.muteTime) return mute.unmute().update()
          ModAction.delayedAction(user, target, guild.id, 'mute', mute.muteTime.getTime() - Date.now())
        })
      })

    }))

    /* Get active tickets */
    Ticket.fetchAllActive().then(async ({ items: tickets }) => {
      const { ticketManager } = client.managers
      const uniqueGuildIds = [...new Set(tickets.map(t => t.guildId))]
      await client.guilds.fetch()
      const guilds = [...client.guilds.cache.values()].filter(g => uniqueGuildIds.includes(g.id))
      guilds.forEach(async g => {
        await g.channels.fetch()
        const guildTickets = tickets.filter(t => t.guildId === g.id)
        const guildMemberIds = guildTickets.map(g => g.memberId)
        await g.members.fetch({ user: guildMemberIds })

        guildTickets.forEach(ticket => {
          const member = g.members.cache.get(ticket.memberId)
          const channel = g.channels.cache.get(ticket.channelId)

          if (!member || !channel) return ticket.setActive(false).setReason('Automated invalidation').setClosedAt(new Date()).update()
          ticketManager.createTicket(member, channel, ticket)
        })
      })
    })

    logger.info('Fetching active mutes..')
    // ModActions.loadAllMutes(client)
    // ModActions.monitorMutes()

    TwitchManager.getManager().fetchTrackers(client)
    new VoteManager(client)

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

    client.user?.setActivity('/ticket to contact staff!', { type: ActivityType.Watching })

    logger.info(`Invite me at: ${url}`)

    logger.info('Now listening for events..');
  }

}