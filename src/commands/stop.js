import { Message } from 'discord.js';
import { connected, stop } from '../handlers/songHandler';

/**
 * 
 * @param {*} client 
 * @param {Message} message 
 * @param {*} args 
 */
export const run = async (client, message, args) => {

  if (connected(message.guild.id)) {

    stop(message.guild.id);

  } else {
    message.channel.send(`I'm not in a Voice Channel!`);
  }
}

export const help = {
  name: "stop",
  category: "Music",
  description:
    "Stops all music and empties the queue.",
  usage: "stop"
};
