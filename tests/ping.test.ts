import { Client, Collection } from 'discord.js'
import { Ping } from '../src/commands/informational/ping'

const Message = require('../src/events/message')

jest.mock('../src/commands/ping')

const message = {
  content: '=ping',
  author: {
    bot: false
  }
}

const message2 = {
  ...message,
  content: "ping"
}

const message3 = {
  ...message,
  content: "!ping"
}

let client: Client = new Object() as Client
client.commands = new Collection()
client.commands.set("ping", require('../src/commands/ping'))

describe("LeegionBot", () => {
  test("Missing prefix", () => {
    Message(client, message2)
    expect(Ping).toBeCalledTimes(0)
  })

  test("Wrong prefix", () => {
    Message(client, message3)
    expect(Ping).toBeCalledTimes(0)
  })

  test("Ping pong response", () => {
    Message(client, message)
    expect(Ping).toBeCalledTimes(1)
  })
})
