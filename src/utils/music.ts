import { VoiceChannel, TextChannel, VoiceConnection } from "discord.js";
import ytdl from 'ytdl-core';
import logger from "./logger";

const TIMEOUT = 30000;

const queue = new Map<string, QueueObject>();

interface Song {
  url: string
  title: string
}

export class QueueObject {

  private guildId: string
  private textChannel: TextChannel
  private voiceChannel: VoiceChannel
  private connection: VoiceConnection
  public songs: Array<Song>
  private volume: number
  public playing: boolean
  private timer: NodeJS.Timeout

  constructor(textChannel: TextChannel, voiceChannel: VoiceChannel, connection: VoiceConnection) {
    this.guildId = textChannel.guild.id
    this.textChannel = textChannel
    this.voiceChannel = voiceChannel
    this.connection = connection
    this.songs = []
    this.volume = 5
    this.playing = false
    this.timer = setTimeout(() => {
      this.disconnectClient()
    }, TIMEOUT)

    queue.set(this.guildId, this)
  }

  public static fetchQueueByGuildId(guildId: string) {
    return queue.get(guildId)
  }

  private disconnectClient() {
    try {
      this.voiceChannel.leave()
      this.textChannel.send('Left the voice channel due to inactivity!');
      queue.delete(this.guildId)
    } catch (e) {
      logger.error(`Error disconnecting voice client\n${e}`)
    }
  }

  public async addSong(url: string) {
    try {
      const song = await ytdl.getInfo(url);
      this.songs.push({
        title: song.title,
        url: song.video_url,
      });
      this.textChannel.send(`Added **${song.title}** to the music queue!`);
      return true;
    } catch {
      logger.debug(`Couldn't find a song for argument: ${url}`);
      throw `Couldn't find a song for ${url}!`;
    }
  }

  public play() {
    if (this.songs.length === 0) {
      this.timer = setTimeout(() => {
        this.disconnectClient()
      }, TIMEOUT)
      return
    }

    this.playing = true
    const dispatcher = this.connection
      .play(ytdl(this.songs[0].url, {
        quality: 'highestaudio'
      }))
      .on('start', () => {
        if (this.timer) clearTimeout(this.timer)
      })
      .on('end', () => {
        logger.debug('Song ending..')
        this.songs.shift()
        this.play()
      })
      .on('error', e => {
        logger.error(e)
      })

    dispatcher.setVolumeLogarithmic(this.volume / 5)
    this.textChannel.send(`Now playing **${this.songs[0].title}**`)
  }

  public skip() {
    if (this.songs.length === 0) {
      throw 'There are no songs in the queue to skip!'
    }

    this.textChannel.send('Skipping..')
    this.connection.dispatcher.end()
  }

  public stop() {

    try{

      this.songs = []
      this.textChannel.send('Stopped playing music!')

      this.connection.dispatcher.end()
      if (this.timer) clearTimeout(this.timer)

      this.voiceChannel.leave()
      queue.delete(this.guildId)

    } catch (e) {
      logger.error(e)
    }

  }

}