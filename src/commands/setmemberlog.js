import * as dynamoDbLib from "../libs/dynamodb-lib";

exports.run = async (client, message, args) => {
  const owner = await client.fetchApplication().then(application => {
    return application.owner;
  });

  if (!message.member.hasPermission("ADMINISTRATOR")) {
    if (owner !== message.author) {
      message.channel.send(`You're not allowed to perform this action!`);
      return;
    }
  }

  const params = {
    TableName: "botConfig",
    Item: {
      guildId: message.guild.id,
      channelId: message.channel.id,
      type: "memberlog",
      createdAt: Date.now()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    message.channel.send(
      `Set the current channel <#${message.channel.id}> for members joined / left.`
    );
  } catch (e) {
    console.log(e);
  }
};

exports.help = {
  name: "setmemberlog",
  category: "Moderation",
  description: "Sets a feed to the current channel for new Guild Members.",
  usage: "setmemberlog"
};
