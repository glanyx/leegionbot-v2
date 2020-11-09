import { Client, Message } from 'discord.js'
import config from "../config/config"
import { SecretSantaMap } from '../handlers/SecretSanta'

export const run = async (client: Client, message: Message, args: string[]) => {
  
  const { author: user, channel } = message

  if (!message.guild) {
    channel.send('Please use this command in the Discord server you registered for. Not to worry, you will be sent your profile in DMs!')
    return
  }

  const serverProfile = SecretSantaMap.get(message.guild.id)

  if (!serverProfile) {
    channel.send(`It doesn't look like the Secret Santa event is enabled on this server! Please talk to the server owner.`)
    return
  }

  const santaProfile = serverProfile.profiles.get(user.id)

  if (!santaProfile) {
    channel.send(`It looks like you haven't registered yet! You can register by typing \`${config.prefix}santaregister\`!`)
    return
  }

  try {
    user.send(santaProfile.createProfileEmbed(user))
  } catch (e) {
    console.log(e)
    channel.send(`I wasn't able to DM you! If you have DMs disabled, please temporarily enable them!`)
  }
}

exports.help = {
  name: "santaprofile",
  category: "Secret Santa",
  description: "Checks your Secret Santa profile.",
  usage: "santaprofile"
};
