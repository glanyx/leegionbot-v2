// import { Help, Config, IExecuteArgs, ClientUser, TextChannel } from 'discord.js'
// import { logger, QueueObject } from "../../utils"

// const help: Help = {
//   name: "join",
//   category: "Music",
//   description: "Joins the Voice Channel of the guild member executing this command. Must be in a voice channel.",
//   usage: "join",
//   example: [
//     'join',
//   ]
// }

// const configs: Config = {
//   permissions: [
//     'SEND_MESSAGES'
//   ]
// }

// export class Join {

//   public static async run({
//     client,
//     message,
//     args
//   }: IExecuteArgs) {

//     const { member, guild, channel } = message
//     if (!member || !guild) return

//     if (member.voice.channel) {

//       const clientUser = client.user as ClientUser
    
//       const perms = member.voice.channel.permissionsFor(clientUser)
      
//       if (!perms || !perms.has('CONNECT') || !perms.has('SPEAK')) {
//         channel.send('Please add permissions for CONNECT and SPEAK to me. Then try again!')
//         return
//       }
  
//       if (QueueObject.fetchQueueByGuildId(guild.id)) {
//         message.channel.send(`I'm already in a voice channel!`)
//         return
//       }
  
//       member.voice.channel.join()
//         .then(conn => {
//           new QueueObject((message.channel as TextChannel), conn.channel, conn)
//         })
//         .catch(e => {
//           logger.error(e)
//           channel.send(`Unable to join the voice channel.`)
//         })
//     } else {
//       channel.send(`You must be in a voice channel!`)
//     }
//   }

//   public static get help() {
//     return help
//   }

//   public static get configs() {
//     return configs
//   }

// }