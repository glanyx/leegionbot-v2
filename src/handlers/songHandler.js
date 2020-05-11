import { VoiceChannel, TextChannel } from "discord.js";
import ytdl from 'ytdl-core';

const TIMEOUT = 10000;

const queue = new Map();

/**
 * 
 * @param {string} guildId 
 * @param {QueueObject} object 
 */
export const createQueue = (guildId, object) => {
  queue.set(guildId, object);
  object.timer = setTimeout(() => {
    disconnectClient(guildId)
  }, TIMEOUT);
}

/**
 * 
 * @param {string} guildId 
 * @returns {QueueObject}
 */
export const getInstance = guildId => {
  return queue.get(guildId);
}

export const addSong = async (guildId, url) => {
  const instance = queue.get(guildId);
  try {
    const song = await ytdl.getInfo(url);
    instance.songs.push({
      title: song.title,
      url: song.video_url,
    });
    instance.textChannel.send(`Added **${song.title}** to the music queue!`);
    return true;
  } catch {
    console.log(`Couldn't find a song for argument:`);
    console.log(`${url}`);
    throw `Couldn't find a song for that!`;
  }
}

export const connected = guildId => {
  return queue.has(guildId);
}

export const playing = guildId => {
  return getInstance(guildId).playing;
}

export class QueueObject {

  /**
   * 
   * @param {TextChannel} textChannel 
   * @param {VoiceChannel} voiceChannel
   */
  constructor(textChannel, voiceChannel, connection) {
    this.textChannel = textChannel;
    this.voiceChannel = voiceChannel;
    this.connection = connection;
    this.songs = [];
    this.volume = 5;
    this.playing = false;
    this.timer = null;
  }
}

const disconnectClient = guildId => {
  const instance = getInstance(guildId);
  try {
    instance.voiceChannel.leave();
    instance.textChannel.send('Left the voice channel due to inactivity!');
    queue.delete(guildId);
  } catch (e) {
    console.log('Error disconnecting voice client');
    console.log(e);
  }
}

export const play = guildId => {

  const instance = getInstance(guildId);

  if (instance.songs.length === 0) {
    instance.timer = setTimeout(() => {
      disconnectClient(guildId)
    }, TIMEOUT);
    return;
  }

  instance.playing = true;
  const dispatcher = instance.connection
    .playStream(ytdl(instance.songs[0].url))
    .on('start', () => {
      clearTimeout(instance.timer);
    })
    .on('end', () => {
      console.log('Song ending..');
      instance.songs.shift();
      play(guildId);
    })
    .on('error', e => {
      console.log(e);
    })
  
  dispatcher.setVolumeLogarithmic(instance.volume / 5);
  instance.textChannel.send(`Now playing **${instance.songs[0].title}**`);
}

export const skip = guildId => {
  const instance = getInstance(guildId);
  if (instance.songs.length === 0) {
    throw 'There are no songs in the queue to skip!';
  }

  instance.textChannel.send('Skipping..');
  instance.connection.dispatcher.end();
}

export const stop = guildId => {
  try {
    const instance = getInstance(guildId);
    instance.songs = [];

    instance.textChannel.send('Stopped playing music!');
    
    instance.connection.dispatcher.end();
    clearTimeout(instance.timer);
    instance.voiceChannel.leave();
    queue.delete(guildId);
  } catch (e) {
    console.log(e);
  }
}