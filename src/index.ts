import './typings/native/date.extension'
import './typings/native/string.extension'

import { Client, Collection } from 'discord.js'

import Events from './events'
import Commands from './commands'

import * as Sentry from '@sentry/node'
import { logger, TwitchClient, TwitterClient } from './utils'
import TwitchEvents from './events/twitch'
import TwitterEvents from './events/twitter'

const client = new Client()
client.commands = new Collection()

const twitchClient = new TwitchClient().track('leeandlie').start()
const twitterClient = new TwitterClient()
twitterClient.addRule('453582519087005696', {
  from: 'LeeandLie'
})

process.title = 'leegionbot'

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

TwitchEvents.forEach((event: any) => {
  const eventName = event.name.toCamelCase()
  twitchClient.on(eventName, event.execute.bind(null, {
    discordClient: client,
    twitchClient
  }))
})

TwitterEvents.forEach((event: any) => {
  const eventName = event.name.toCamelCase()
  twitterClient.on(eventName, event.execute.bind(null, {
    discordClient: client,
    twitterClient
  }))
})

client.login(process.env.DISCORD_TOKEN)
