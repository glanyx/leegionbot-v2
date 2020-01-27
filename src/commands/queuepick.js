import { livechat, pick } from "../libs/livechat-lib";

exports.run = async (client, message, args) => {
  if (livechat.state) {
    if (livechat.queue.length > 0) {
      let user = pick();
      message.channel.send(`It's your turn to ask a question, ${user}!`);
    } else {
      message.channel.send("The queue is empty!");
    }
  } else {
    message.channel.send("There is no Livechat active!");
  }
};

exports.help = {
  name: "queuepick",
  category: "Livechat",
  description:
    "Picks a user from the queue. Must have a currently active Livechat session.",
  usage: "queuepick"
};
