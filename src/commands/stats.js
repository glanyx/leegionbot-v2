import { Client, Message, MessageEmbed } from 'discord.js';
import * as dateFormatLib from "../libs/dateformat-lib";

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 * @param {Array<String>} args 
 */
exports.run = (client, message, args) => {
  const roles = [
    "super vip",
    "vip",
    "general",
    "lieutenant",
    "corporal",
    "sergeant",
    "private",
    "cadet"
  ];

  let onlineCount = 0;
  message.guild.members.cache.forEach(member => {
    if (member.user.presence.status !== "offline") {
      onlineCount++;
    }
  });

  let roleString = ""
  const guildRoles = message.guild.roles.cache.array()
  const filteredRoles = guildRoles.filter(role =>
    roles.includes(role.name.toLowerCase())
  )

  filteredRoles.sort((c, p) => 
    c.position < p.position ? 1 : -1
  ).forEach(role =>
    roleString += `${role}: ${role.members.size} Total Members\n`
  )

  const embed = new MessageEmbed()
    .setTitle(`**=== ${message.guild.name.toUpperCase()} STATS ===**`)
    .setAuthor(client.user.username,client.user.avatarURL())
    .setTimestamp()
    .setColor(16622136)
    .setFooter(message.guild.name, message.guild.iconURL())
    .addField('**Server Name**', message.guild.name)
    .addField('**Server Owner**', message.guild.owner.user)
    .addField('**Server Creation Date**', message.guild.createdAt)
    .addField('**Total Members**', `${message.guild.members.cache.size} (${onlineCount} online)`)
    .addField('**Roles**', roleString ? roleString : 'None')
    .addField('**Channels**', message.guild.channels.cache.size)

  message.channel.send(embed);
};

exports.help = {
  name: "stats",
  category: "Information",
  description: "Displays Guild information.",
  usage: "stats"
};
