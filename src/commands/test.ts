import { getGeoLocation, getStreetData } from '../libs/address-lib'
import { Client, Message, TextChannel, MessageEmbed } from 'discord.js'

export const run = async (client: Client, message: Message, args: string[]) => {
  message.author.send('hi')
}