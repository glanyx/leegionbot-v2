import * as dynamoDbLib from '../libs/dynamodb-lib';

exports.run = async (client, message, args) => {

    const params = {
        TableName: "botConfig",
        Item: {
            guildId: message.guild.id,
            channelId: message.channel.id,
            type: "mediafeed",
            createdAt: Date.now()
        }
    };

    try{
        await dynamoDbLib.call("put", params);
        message.channel.send(`Twitter and Patreon feed will now post to channel <#${message.channel.id}>.`);
    } catch (e) {
        console.log(e);
    }

}