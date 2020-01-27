import { livechat, end } from "../libs/livechat-lib";

exports.run = async (client, message, args) => {
  if (
    message.member.hasPermission("ADMINISTRATOR") ||
    message.member.hasPermission("MANAGE_GUILD")
  ) {
    if (livechat.state) {
      end();
      message.channel.send(
        `The Patreon Livechat has now ended. :star2: Thanks for tuning in, until next month! :star2:`
      );
    } else {
      message.channel.send("There is no Livechat active!");
    }
  } else {
    message.channel.send(
      `You don't have the required permissions to perform this action!`
    );
  }
};

exports.help = {
  name: "endchat",
  category: "Livechat",
  description: "Ends a currently running Livechat session.",
  usage: "endchat"
};
