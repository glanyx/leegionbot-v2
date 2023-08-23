import './typings/native/date.extension'
import './typings/native/string.extension'

import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js'

import { Events } from './events'
import { Commands } from './commands'

import * as Sentry from '@sentry/node'
import { logger, TwitchManager, SpamFilter, LevelsManager } from './utils'
import { BirthdayManager, ClientRoleManager } from './managers'

import { registerFont } from 'canvas'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel
  ]
})
client.commands = new Collection()
client.roleManager = new ClientRoleManager()

new TwitchManager(client)
new BirthdayManager(client)

process.title = 'leegionbot'

registerFont('./src//assets/Roboto-Regular.ttf', { family: 'Roboto' })
registerFont('./src//assets/Roboto-Bold.ttf', { family: 'Roboto Bold' })

if (process.env.SENTRY_DSN) {
  logger.info('Establishing connection to Sentry..')
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  })
}

Events.forEach((event: any) => {
  const eventName = event.name.toCamelCase()
  client.on(eventName, event.execute.bind(null, client))
})

Commands.forEach(command => {
  const commandName = command.help.name.toLowerCase()
  logger.info(`Attempting to load command ${commandName}`)
  client.commands.set(commandName, command)
})

client.login(process.env.DISCORD_TOKEN)

new SpamFilter(client)
new LevelsManager(client)