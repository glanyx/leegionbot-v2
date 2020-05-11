const Discord = require('discord.js');
import * as dynamoDbLib from '../libs/dynamodb-lib';

const guildId = '453582519087005696';

exports.handler = async (client, event) => {

  const params = {
    TableName: "botConfig",
    Key: {
      guildId: guildId,
      type: "mediafeed",
    }
  };

  try{
    const conf = await dynamoDbLib.call("get", params);
    if (conf.Item){
      const channelId  = conf.Item.channelId;
      client.guilds.get(guildId).channels.get(channelId).send(await generateEmbed(client, event));
    } else {
      return;
    }
      
  } catch (e) {
    console.log(`Couldn't send message to feed. Invalid config?`);
    console.log(e);
  }

}

async function generateEmbed(client, event) {

  const owner = client.guilds.get(guildId).owner.user;
  const tweet = event.retweeted_status ? event.retweeted_status : event;
  const retweet = event.retweeted_status ? true : false;

  let embed = new Discord.RichEmbed()
    .setAuthor(`${owner.username}`, `${event.user.profile_image_url_https}`)
    .setTitle(`@${event.user.screen_name}`)
    .setURL(`https://twitter.com/${event.user.screen_name}`)
    .setColor(5614830)
    .setTimestamp()
    .setFooter(`From Twitter`, `https://abs.twimg.com/icons/apple-touch-icon-192x192.png`)
    .setDescription(`${retweet ? `Retweeting [@${tweet.user.screen_name}](https://twitter.com/${tweet.user.screen_name}):\n\n` : ''}${tweet.extended_tweet ? tweet.extended_tweet.full_text : tweet.text}\n[View on Twitter](https://twitter.com/${event.user.screen_name}/status/${event.id_str})`);

  return embed;
}