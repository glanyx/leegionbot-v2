import { Client, Message, MessageEmbed, Guild, GuildMember } from "discord.js";
import * as dateFormatLib from "../libs/dateformat-lib";

export const run = async (client: Client, message: Message, args: string[]) => {

  const { guild, member } = message

  if (!guild) return
  if (!member) return

  if (message.mentions.members && message.mentions.members.first()) {
    message.mentions.members.forEach(async member => {
      const embed = await generateProfile(guild, member);
      await message.channel.send(embed);
    });
    return;
  }
  const embed = await generateProfile(guild, member);
  message.channel.send(embed);
};

const generateProfile = async (guild: Guild, gMember: GuildMember) => {
  let joinPos = 1;
  let roleString = "";

  await guild.members.fetch()
  await guild.roles.fetch()

  guild.members.cache.forEach(async member => {
    if (member && member !== gMember) {
      if (!member.joinedAt || !gMember.joinedAt) return
      if (member.joinedAt < gMember.joinedAt) {
        joinPos++;
      }
    }
  });

  gMember.roles.cache.forEach(role => {
    if (role.name !== "@everyone") {
      roleString += `<@&${role.id}>\n`;
    }
  });

  const highestRole = gMember.roles.highest

  return new MessageEmbed()
    .setAuthor(gMember.user.tag, gMember.user.avatarURL() || undefined)
    .setThumbnail(gMember.user.avatarURL() || '')
    .setColor(highestRole.color)
    .setTimestamp()
    .setFooter(`Powered by ${gMember.client.user?.username || 'LeegionBot'}`)
    .addField("**User**", `${gMember.user.username} [${gMember.user}]`, true)
    .addField("**Status**", gMember.presence.status, true)
    .addField(
      "**Creation Date**",
      dateFormatLib.format(gMember.user.createdAt),
      true
    )
    .addField("**User ID**", gMember.id, true)
    .addField("**Join Date**", dateFormatLib.format(gMember.joinedAt), true)
    .addField("**Join Position**", joinPos, true)
    .addField("**Roles**", roleString, true);
}

exports.help = {
  name: "who",
  category: "Information",
  description: "Displays Member information on yourself or a mentioned Member.",
  usage: "who [@user]"
};
