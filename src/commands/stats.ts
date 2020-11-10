import { Client, Message, MessageEmbed } from 'discord.js';
import * as dateFormatLib from "../libs/dateformat-lib";

export const run = async (client: Client, message: Message, args: string[]) => {

  const { author: user, channel, guild } = message
  const { user: self } = client
  if (!self) return

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

  if (!guild) {
    channel.send('Please use this command in a server.')
    return
  }

  await guild.members.fetch()
  await guild.roles.fetch()

  let onlineCount = 0;
  guild.members.cache.forEach(member => {
    if (member.user.presence.status !== "offline") {
      onlineCount++;
    }
  });

  let roleString = ""
  const guildRoles = guild.roles.cache.array()
  const filteredRoles = guildRoles.filter(role =>
    roles.includes(role.name.toLowerCase())
  )

  filteredRoles.sort((c, p) => 
    c.position < p.position ? 1 : -1
  ).forEach(role =>
    roleString += `${role}: ${role.members.size} Total Members\n`
  )

  const embed = new MessageEmbed()
    .setTitle(`**=== ${guild.name.toUpperCase()} STATS ===**`)
    .setAuthor(self.username, self.avatarURL() || undefined)
    .setTimestamp()
    .setColor(16622136)
    .setFooter(guild.name, guild.iconURL() || undefined)
    .addField('**Server Name**', guild.name)
    .addField('**Server Owner**', guild.owner?.user || '*Unknown*')
    .addField('**Server Creation Date**', guild.createdAt)
    .addField('**Total Members**', `${guild.members.cache.size} (${onlineCount} online)`)
    .addField('**Roles**', roleString ? roleString : 'None')
    .addField('**Channels**', guild.channels.cache.size)

  message.channel.send(embed);
};

exports.help = {
  name: "stats",
  category: "Information",
  description: "Displays Guild information.",
  usage: "stats"
};
