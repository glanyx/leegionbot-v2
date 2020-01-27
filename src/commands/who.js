import Discord from "discord.js";
import * as dateFormatLib from "../libs/dateformat-lib";

exports.run = async (client, message, args) => {
  if (message.mentions.members.first()) {
    message.mentions.members.forEach(async member => {
      const embed = generateProfile(message.guild, member);
      await message.channel.send(embed);
    });
    return;
  }
  const embed = generateProfile(message.guild, message.member);
  message.channel.send(embed);
};

function generateProfile(guild, gMember) {
  let joinPos = 1;
  let roleString = "";

  guild.members.forEach(member => {
    if (member !== gMember) {
      if (member.joinedAt < gMember.joinedAt) {
        joinPos++;
      }
    }
  });
  gMember.roles.forEach(role => {
    if (role.name !== "@everyone") {
      roleString += `${role}\n`;
    }
  });

  return new Discord.RichEmbed()
    .setAuthor(gMember.user.tag, gMember.user.avatarURL)
    .setThumbnail(gMember.user.avatarURL)
    .setColor(gMember.highestRole.color)
    .setTimestamp()
    .setFooter(`Powered by ${gMember.client.user.username}`)
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
