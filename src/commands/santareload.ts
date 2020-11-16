import { getAllServerConfigs } from '../handlers/SecretSanta'
import { Client, Message } from 'discord.js'

export const run = async (client: Client, message: Message, args: string[]) => {
  
  const { author: user, channel } = message
  const owner = await client.fetchApplication().then(application => {
    return application.owner
  });

  if (user !== owner) return

  channel.send('Reloading..')
  await getAllServerConfigs()
  channel.send('Finished')
}

export const help = {
  name: "santareload",
  category: "Secret Santa",
  description: "Bot Owner ONLY! Reloads cache from DB.",
  usage: "santareload"
};
