exports.run = async (client, message, args) => {
  message.channel.send(
    `The suggestions functionality is temporarily disabled whilst I'm being upgraded! Sit tight and apologies for the inconvenience!`
  );
};

exports.help = {
  name: "suggestion",
  category: "Feedback",
  description:
    "Adds a Suggestion to the queue of Suggestions. (Currently W.I.P.)",
  usage: "suggestion add [your suggestion]"
};
