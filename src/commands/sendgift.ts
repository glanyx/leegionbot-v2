import { Client, User, Message, MessageEmbed, ClientUser } from "discord.js"
import config from "../config/config"
import * as dynamoDbLib from "../libs/dynamodb-lib"
import { SecretSantaMap } from '../handlers/SecretSanta'

interface IGift {
  item: string[]
  type: string
  message: string
  confirmed: boolean
}

/**
 * Runs the wizard for gift sending. User is requested multiple inputs. Message will be sent to their recipient matched on DynamoDB, based on santadistribute function.
 */
export const run = async (client: Client, message: Message, args: string[]) => {
  
  const { author: user, channel } = message
  const self = client.user
  
  if (!self) {
    channel.send('Something seems to have gone wrong. Please contact my owner for assistance.')
    return
  }
  
  if (!message.guild) {
    channel.send('Please use this command in the Discord server you registered for. Not to worry, you will be asked about your gift in DMs!')
    return
  }

  const serverProfile = SecretSantaMap.get(message.guild.id)

  if (!serverProfile) {
    channel.send(`It doesn't look like the Secret Santa event is enabled on this server! Please talk to the server owner.`)
    return
  }

  const santaProfile = serverProfile.profiles.get(user.id)

  if (!santaProfile) {
    channel.send(`It looks like you haven't registered yet! You can register by typing \`${config.prefix}santaregister\`!`)
    return
  }

  const { targetId } = santaProfile.profile

  if (!targetId) {
    user.send(`It looks like you haven't been assigned a target yet! Please wait for the server owner or one of the administrators to assign Secret Santas!`)
    return
  }

  message.delete()

  const recipient = await client.users.fetch(targetId)
  const gift: IGift = {
    item: [],
    type: '',
    message: "",
    confirmed: false
  };

  try {
    while (!gift.confirmed) {
      gift.item = await getCodes(user);
      gift.type = await getType(user);
      if (await checkMessage(user)) {
        gift.message = await getMessage(user);
      }
      gift.confirmed = await confirmInput(
        user,
        buildEmbed(gift, self),
        `This is the message that will be sent to **${recipient.username}**. Is this correct?`
      );
    }
    user.send(
      `Thanks ${user.username}! **${recipient.username}** should receive their gift in just a moment!`
    );
    recipient.send(buildEmbed(gift, self));
  } catch (e) {
    console.log(e);
    user.send(e.message);
    return;
  }
}

/**
 * Requests the user for the item they are sending.

 */
const getCodes = (user: User): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    getInput(
      user,
      "Ready to send your gift? Great! Please send me your gift code or a URL to the gift.\nIf you have more than 1 gift to send, please send all in a single message with each item separated by a comma `,`!"
    )
      .then(collected => {
        resolve(collected.split(",").map(str => str.trim()))
      })
      .catch(e => {
        reject(new Error(e.message));
      });
  });
}

/**
 * Requests the user what type of gift they are sending.
 */
const getType = (user: User): Promise<string> => {
  return new Promise((resolve, reject) => {
    getInput(
      user,
      "Awesome! And what is it I'm sending? Am I sending a gift code? Am I sending a link to artwork?"
    )
      .then(collected => {
        resolve(collected);
      })
      .catch(e => {
        reject(new Error(e.message));
      });
  });
}

/**
 * Requests the user if they want to send a message with their gift.
 */
const checkMessage = (user: User): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    confirmInput(
      user,
      "Do you want to send a message along with your gift?\n**PROTIP: This is a great chance to wish your TARGET a Merry Christmas!**"
    )
      .then(collected => {
        resolve(collected);
      })
      .catch(e => {
        reject(new Error(e.message));
      });
  });
}

/**
 * Requests a message from the user they would like to send along with their gift.
 */
const getMessage = (user: User): Promise<string> => {
  return new Promise((resolve, reject) => {
    getInput(user, "What message will you send with your gift?")
      .then(collected => {
        resolve(collected);
      })
      .catch(e => {
        reject(new Error(e.message));
      });
  });
}

/**
 * Requests input from the user. Returns input from the user.
 */
const getInput = (user: User, msg: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    user
      .send(msg)
      .then(message => {
        const collector = message.channel.createMessageCollector(
          message => user === message.author,
          {
            time: 180000,
            max: 1,
          }
        );

        collector.on("collect", async (m: Message) => {
          resolve(m.content);
        });
      })
      .catch(e => {
        reject(new Error("The message timed out."));
        console.log(e);
      });
  });
}

/**
 * Send a confirmation request to a user based on Discord reactions.
 */
const confirmInput = (user: User, input: string | string[] | MessageEmbed, prompt?: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    if (prompt) await user.send(prompt)

    user.send(input).then(async message => {
      await message.react("507285695484919809");
      message.react("507287289282428962");
      message
        .awaitReactions((reaction, userA) => userA === user, {
          max: 1,
          time: 180000,
          errors: ["time"]
        })
        .then(collected => {
          const firstEmoji = collected.first()
          if (firstEmoji && firstEmoji.emoji.id === "507285695484919809") {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(e => {
          reject(new Error("The message timed out."));
        });
    });
  });
}

/**
 * Builds the Discord embed message based on the gift
 */
const buildEmbed = (profile: IGift, bot: ClientUser) => {
  let embed = new MessageEmbed()
    .setImage(
      "https://img.etimg.com/thumb/msid-67267294,width-643,imgsize-671579,resizemode-4/santaa.jpg"
    )
    .setColor("#d42426")
    .setTitle("A gift has arrived from your Secret Santa!")
    .setDescription(profile.message)
    .setTimestamp()
    .setFooter(`Powered by ${bot.username}`);

  profile.item.forEach(str => {
    embed.addField(profile.type, str);
  });

  return embed;
}

export const help = {
  name: "sendgift",
  category: "Secret Santa",
  description:
    "Starts the process to send a gift to your matched Secret Santa recipient. You MUST have an assigned recipient to use this feature.",
  usage: "sendgift"
};
