import * as dynamoDbLib from '../libs/dynamodb-lib';

module.exports = async (client, member) => {

    const params = {
        TableName: "botConfig",
        Key: {
            guildId: member.guild.id,
            type: "memberlog",
        }
    };

    try{
        const conf = await dynamoDbLib.call("get", params);
        if (conf.Item){
            const channelId  = conf.Item.channelId;
            member.guild.channels.get(channelId).send(`${member.user.username} joined the server.`);
        } else {
            return;
        }
        
    } catch (e) {
        console.log(`Couldn't send message to log. Invalid config?`);
        console.log(e);
    }
}