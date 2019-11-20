import * as dynamoDbLib from '../libs/dynamodb-lib';

exports.run = async (client, message, args) => {

    const params = {
        TableName: "botConfig",
        Item: {
            guildId: message.guild.id,
            channelId: message.channel.id,
            type: "messagelog",
            createdAt: Date.now()
        }
    };

    try{
        await dynamoDbLib.call("put", params);
        message.channel.send(`Set the current channel <#${message.channel.id}> for deleted and edited messages.`);
    } catch (e) {
        console.log(e);
    }

}