import Discord from 'discord.js';
import * as dynamoDbLib from '../libs/dynamodb-lib';
import config from '../config/config';

exports.run = async (client, message, args) => {

    let user = message.author;

    await client.fetchApplication().then(async application => {
        if (application.owner === message.author) {
            if (args.length > 0){
                try {
                    user = await client.fetchUser(args);
                } catch (e) {
                    message.author.send(`Couldn't find the specified user. Error logged to console.`);
                    console.log(e);
                    return;
                }
            }
        }
    })

    const params = {
        TableName: "santaprofile",
        Key: {
            userId: user.id,
        }
    };

    try{
        const profile = await dynamoDbLib.call("get", params);
        if (profile.Item){
            message.author.send(await generateEmbed(client, profile.Item));
        } else {
            message.author.send(`It doesn't look like you've registered yet! You can register for the Secret Santa event by typing \`${config.prefix}santaregister\`!`);
            return;
        }
        
    } catch (e) {
        message.author.send(`I couldn't fetch your profile! Please try again later or contact my owner.`)
        console.log(`Couldn't fetch santaprofile for user ${user.username}.`)
        console.log(e);
    }

}

async function generateEmbed(client, profile) {

    const regions = {
        "eu": "Europe",
        "na": "North America",
        "sa": "South America",
        "ca": "Canada",
        "as": "Asia", 
        "au": "Australia",
        "me": "Middle East",
        "af": "Africa",
    };

    const user = await client.fetchUser(profile.userId)

    let embed = new Discord.RichEmbed()
        .setAuthor(user.username)
        .setThumbnail(user.avatarURL)
        .setColor()
        .setTimestamp()
        .setFooter(`Powered by ${client.user.username}`)
        .addField('**User**', `${user.username} [${user}]`, true)
        .addField(`**Tier**`, profile.type)
        .addField(`**Themes**`, profile.themes.split(`,`));

    if (profile.type === 'physical') {
        embed
            .addField(`**Location**`, profile.address)
            .addField(`**Geographic Region**`, regions[profile.region]);
    }

    return embed;
}