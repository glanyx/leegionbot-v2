// import * as s3Lib from "../libs/s3-lib";
import { Message } from 'discord.js';
import { QueueObject, createQueue } from '../handlers/songHandler';

/**
 * 
 * @param {*} client 
 * @param {Message} message 
 * @param {*} args 
 */
export const run = async (client, message, args) => {

  if (message.member.voiceChannel) {
    
    const perms = message.member.voiceChannel.permissionsFor(message.client.user);
    if (!perms.has('CONNECT') || !perms.has('SPEAK')) {
      message.channel.send('Please add permissions for CONNECT and SPEAK to me. Then try again!');
      return;
    }

    message.member.voiceChannel.join()
      .then(conn => {
        createQueue(message.guild.id, new QueueObject(message.channel, message.member.voiceChannel, conn))
      })
      .catch(e => {
        console.log(e);
        message.channel.send(`Unable to join the voice channel.`)
      })
  } else {
    message.channel.send(`You must be in a voice channel!`)
  }
}

// /**
//  * @param {Message} message 
//  */
// export const run = async (client, message, args) => {

//   const file = await s3Lib.getFile('will smith.mp3');

//   message.member.voiceChannel.join()
//     .then(conn => {
//       try {
//         conn.playStream(file);
//       } catch (e) {
//         console.log(e);
//       }
//     })
//     .catch(e => console.log(e));
// }

export const help = {
  name: "join",
  category: "Music",
  description:
    "Joins the Voice Channel of the guild member executing this command. Must be in a voice channel.",
  usage: "join"
};
