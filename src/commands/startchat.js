import { livechat, start } from "../libs/livechat-lib";

exports.run = async (client, message, args) => {
  if (
    message.member.hasPermission("ADMINISTRATOR") ||
    message.member.hasPermission("MANAGE_GUILD")
  ) {
    if (livechat.state) {
      message.channel.send("Livechat is already active!");
    } else {
      message.channel
        .send(
          `Hey @everyone! The Patreon Livechat is will be starting soon! :sparkles: Please be considerate to other users during the chat! Push-to-Talk is enforced on this voice channel so please be aware that web users will not be able to speak! By joining the Livechat you agree that you shall not record or publically share recordings of the Livechat. :star2: HAVE FUN! :star2:`
        )
        .then(() => {
          start(message.guild);
        });
    }
  } else {
    message.channel.send(
      `You don't have the required permissions to perform this action!`
    );
  }
};

exports.help = {
  name: "startchat",
  category: "Livechat",
  description:
    "Starts a new Livechat session. Only one active session per Guild is possible at any given time.",
  usage: "startchat"
};
