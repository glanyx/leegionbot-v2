import config from '../config/config';
import { Message } from 'discord.js';
import { connected, addSong, play, getInstance } from '../handlers/songHandler';

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
    }

    if (getInstance(message.guild.id).songs.length === 0) {
      message.channel.send('The song queue is empty!');
      return;
    }

    play(message.guild.id);

  } else {
    message.channel.send(`I'm not in a Voice Channel! Use \`${config.prefix}join\` so I can join your channel!`);
  }
}

export const help = {
  name: "play",
  category: "Music",
  description:
    "Plays through the current list of songs in the queue. Bot must be in a Voice Channel to use. If a URL is provided and the queue is empty, this song will play.",
  usage: "play [optional: url]"
};
