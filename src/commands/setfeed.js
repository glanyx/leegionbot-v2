import * as dynamoDbLib from '../libs/dynamodb-lib';

exports.run = async (client, message, args) => {

    const owner = await client.fetchApplication().then(application => {
        return application.owner;
    });

    if(!message.member.hasPermission('ADMINISTRATOR')){
        if (owner !== message.author){
            message.channel.send(`You're not allowed to perform this action!`);
            return;
        };
    };

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