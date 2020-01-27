exports.run = (client, message, args) => {
  message.channel.send("Pong!");
};

exports.help = {
  name: "ping",
  category: "Fun",
  description: "Pong!",
  usage: "ping"
};
