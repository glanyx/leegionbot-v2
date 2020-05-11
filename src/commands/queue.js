import config from '../config/config';
import { Message } from 'discord.js';
import { connected, addSong, play } from '../handlers/songHandler';

/**
 * 
 * @param {*} client 
 * @param {Message} message 
 * @param {*} args 
 */
export const run = async (client, message, args) => {

  if (connected(message.guild.id)) {

    if (args) {
      try{
        await addSong(message.guild.id, args[0]);
      } catch (e) {
        message.channel.send(e);
        return;
      }
    } else {
      message.channel.send(`You must provide a URL!`);
    }

  } else {
    message.channel.send(`I'm not in a Voice Channel! Use \`${config.prefix}join\` so I can join your channel!`);
  }
}

export const help = {
  name: "queue",
  category: "Music",
  description:
    "Adds the URL for this song to the queue.",
  usage: "queue [url]"
};
