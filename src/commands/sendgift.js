import { Client, User, Message, RichEmbed } from "discord.js";
import * as dynamoDbLib from "../libs/dynamodb-lib";

/**
 * Runs the wizard for gift sending. User is requested multiple inputs. Message will be sent to their recipient matched on DynamoDB, based on santadistribute function.
 * @param {Client} client
 * @param {Message} message
 * @param {string[]} args
 */
export async function run(client, message, args) {
  const santa = message.author;
  const recipient = await client.fetchUser(await getTarget(santa));
  const gift = {
    item: [],
    type: null,
    message: "",
    confirmed: false
  };

  try {
    while (!gift.confirmed) {
      gift.item = await getCodes(santa);
      gift.type = await getType(santa);
      if (await checkMessage(santa)) {
        gift.message = await getMessage(santa);
      }
      gift.confirmed = await confirmInput(
        santa,
        buildEmbed(gift, client.user),
        `This is the message that will be sent to **${recipient.username}**. Is this correct?`
      );
    }
    santa.send(
      `Thanks ${santa}! **${recipient.username}** should receive their gift in just a moment!`
    );
    recipient.send(buildEmbed(gift, client.user));
  } catch (e) {
    console.log(e);
    santa.send(e.message);
    return;
  }
}

/**
 * Requests the user for the item they are sending.
 * @param {User} user
 * @returns {Promise<string|string[]>}
 */
function getCodes(user) {
  return new Promise((resolve, reject) => {
    getInput(
      user,
      "Ready to send your gift? Great! Please send me your gift code or a URL to the gift.\nIf you have more than 1 gift to send, please send all in a single message with each item separated by a comma `,`!"
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
 * Requests the user what type of gift they are sending.
 * @param {User} user
 * @returns {Promise<string|string[]>}
 */
function getType(user) {
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
 * @param {User} user
 * @returns {Promise<boolean>}
 */
function checkMessage(user) {
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
 * @param {User} user
 * @returns {Promise<string|string[]>}
 */
function getMessage(user) {
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
 * @param {User} user - Discord user instance.
 * @returns {Promise<string|string[]>} - Returns a promise based on the Discord MessageCollector.
 */
function getInput(user, msg) {
  return new Promise((resolve, reject) => {
    user
      .send(msg)
      .then(message => {
        const collector = message.channel.createMessageCollector(
          message => user === message.author,
          {
            time: 180000,
            max: 1,
            errors: ["time"]
          }
        );

        collector.on("collect", async m => {
          resolve(m.content.split(",").map(str => str.trim()));
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
 * @param {User} user - Instance of a Discord User.
 * @param {string|string[]} [input] - Content originally sent by the user.
 * @param {string} [prompt='Is this correct?'] - Message to send to the user.
 * @returns {Promise<boolean>} - Returns a boolean Promise based on the user's confirmation or rejection of the input.
 */
function confirmInput(user, input, prompt) {
  return new Promise((resolve, reject) => {
    if (prompt) {
      user.send(prompt);
    }

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
          if (collected.first().emoji.id === "507285695484919809") {
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
 * @param {Object} profile
 * @param {User} bot - LeegionBot
 */
function buildEmbed(profile, bot) {
  let embed = new RichEmbed()
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

/**
 * Fetches the santa's target from the configured DynamoDB
 * @param {User} user
 * @returns {string} - Returns the Discord user ID for the matched santa profile
 */
async function getTarget(user) {
  const params = {
    TableName: "santamatch",
    Key: {
      userId: user.id
    }
  };

  return new Promise(async (resolve, reject) => {
    try {
      const profile = await dynamoDbLib.call("get", params);
      if (profile.Item) {
        resolve(profile.Item.recipientId);
      } else {
        reject(
          new Error(
            `I couldn't find your target, ${user}! Please try again, or if you keep running into this issue, contact my owner.`
          )
        );
        console.log(`No target for ${user.id}!`);
        return;
      }
    } catch (e) {
      reject(
        new Error(
          `I couldn't find you in my records! Are you sure you're a Secret Santa?`
        )
      );
      console.log(e);
    }
  });
}

exports.help = {
  name: "sendgift",
  category: "Secret Santa",
  description:
    "Starts the process to send a gift to your matched Secret Santa recipient. You MUST have an assigned recipient to use this feature.",
  usage: "sendgift"
};
