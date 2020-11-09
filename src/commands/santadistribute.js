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

  message.channel.send('This feature has temporarily been disabled. Please stand by.')
//   const arrays = {
//     freeMembers: [],
//     digitalMembers: [],
//     euMembers: [],
//     naMembers: [],
//     saMembers: [],
//     caMembers: [],
//     asMembers: [],
//     auMembers: [],
//     meMembers: [],
//     afMembers: []
//   };

//   const params = {
//     TableName: "santaprofile"
//   };

//   try {
//     const conf = await dynamoDbLib.call("scan", params);
//     if (conf.Items) {
//       conf.Items.forEach(item => {
//         const user = item.userId;
//         switch (item.type) {
//           case "special":
//             // This should technically be * arrays.length
//             const random = Math.floor(Math.random() * 4);
//             const keys = Object.keys(arrays);
//             arrays[keys[random]].push([user, user]);
//             break;
//           case "free":
//             arrays.freeMembers.push([user, user]);
//             break;
//           case "digital":
//             arrays.digitalMembers.push([user, user]);
//             break;
//           case "physical":
//             switch (item.region) {
//               case "eu":
//                 arrays.euMembers.push([user, user]);
//                 break;
//               case "na":
//                 arrays.naMembers.push([user, user]);
//                 break;
//               case "sa":
//                 arrays.saMembers.push([user, user]);
//                 break;
//               case "ca":
//                 arrays.caMembers.push([user, user]);
//                 break;
//               case "as":
//                 arrays.asMembers.push([user, user]);
//                 break;
//               case "au":
//                 arrays.auMembers.push([user, user]);
//                 break;
//               case "me":
//                 arrays.meMembers.push([user, user]);
//                 break;
//               case "af":
//                 arrays.afMembers.push([user, user]);
//                 break;
//               default:
//                 event.channel.send(`Couldn't place user with id ${user}!`);
//                 return;
//             }
//             break;
//           default:
//             event.channel.send(`Couldn't place user with id ${user}!`);
//             return;
//         }
//       });
//     } else {
//       event.channel.send(`No users found!`);
//     }

//     for (const key in arrays) {
//       if (arrays[key].length > 0) {
//         let shuffled = false;
//         while (!shuffled) {
//           console.log(`Shuffling..`);
//           await shuffle(arrays[key]);
//           shuffled = await validateArrayUnique(arrays[key]);
//         }
//       }
//     }
//   } catch (e) {
//     message.channel.send(`Couldn't shuffle users!`);
//     message.channel.send(`Error: ${e.message}`);
//     console.log(e);
//   }

//   for (const key in arrays) {
//     if (arrays[key].length > 0) {
//       for (let i = 0; i < arrays[key].length; i++) {
//         // Send the actual profile
//         const santa = await client.fetchUser(arrays[key][i][0]);
//         const recipient = await client.fetchUser(arrays[key][i][1]);

//         await storeDB(santa.id, recipient.id);

//         const params = {
//           TableName: "santaprofile",
//           Key: {
//             userId: recipient.id
//           }
//         };

//         try {
//           const profile = await dynamoDbLib.call("get", params);
//           if (profile.Item) {
//             santa.send(await generateEmbed(client, profile.Item)).catch(e => {
//               owner.send(
//                 `Couldn't send profile for Recipient ${recipient} to Santa ${santa}!\nReason: ${e.message}`
//               );
//             });
//           } else {
//             owner.send(
//               `Couldn't send profile for Recipient ${recipient} to Santa ${santa}!`
//             );
//           }
//         } catch (e) {
//           owner.send(`Couldn't fetch a profile for ${recipient}!`);
//           console.log(`Couldn't fetch santaprofile for user ${recipient.id}.`);
//           console.log(e);
//         }
//       }
//     }
//   }

//   disable(message.guild.id);
// };

// function shuffle(array) {
//   return new Promise((resolve, reject) => {
//     if (array.length > 1) {
//       for (let i = array.length - 1; i > 0; i--) {
//         let j = Math.floor(Math.random() * (i + 1));
//         [array[i][1], array[j][1]] = [array[j][1], array[i][1]];
//       }
//       resolve(array);
//     } else {
//       reject(new Error(`Array too small.`));
//     }
//   });
// }

// function validateArrayUnique(array) {
//   return new Promise((resolve, reject) => {
//     if (array.length > 1) {
//       for (let i = 0; i < array.length; i++) {
//         if (array[i][0] === array[i][1]) {
//           resolve(false);
//         }
//       }
//       resolve(true);
//     } else {
//       reject(new Error(`Array too small.`));
//     }
//   });
// }

// async function storeDB(santaId, recipientId) {
//   const params = {
//     TableName: "santamatch",
//     Item: {
//       userId: santaId,
//       recipientId: recipientId,
//       createdAt: Date.now()
//     }
//   };

//   try {
//     await dynamoDbLib.call("put", params);
//   } catch (e) {
//     console.log(e);
//   }
// }

// async function generateEmbed(client, profile) {
//   const regions = {
//     eu: "Europe",
//     na: "North America",
//     sa: "South America",
//     ca: "Canada",
//     as: "Asia",
//     au: "Australia",
//     me: "Middle East",
//     af: "Africa"
//   };

//   const user = await client.fetchUser(profile.userId);

//   let embed = new Discord.RichEmbed()
//     .setAuthor(user.username)
//     .setThumbnail(user.avatarURL)
//     .setColor()
//     .setTimestamp()
//     .setFooter(`Powered by ${client.user.username}`)
//     .addField("**User**", `${user.username} [${user}]`, true)
//     .addField(`**Tier**`, profile.type)
//     .addField(`**Themes**`, profile.themes.split(`,`));

//   if (profile.type === "physical" || profile.type === "special") {
//     embed
//       .addField(`**Location**`, profile.address)
//       .addField(`**Geographic Region**`, regions[profile.region]);
//   }

//   return embed;
// }

// async function disable(guildId) {
//   const params = {
//     TableName: "botConfig",
//     Item: {
//       guildId: guildId,
//       type: "santa",
//       enabled: false,
//       createdAt: Date.now()
//     }
//   };

//   try {
//     await dynamoDbLib.call("put", params);
//   } catch (e) {
//     console.log(e);
//   }
}

// exports.help = {
//   name: "santadistribute",
//   category: "Secret Santa",
//   description:
//     "Distributes all currently registered users based on their participation tiers and region.\nOnly available to Server Admins or the Bot Owner.",
//   usage: "santadistribute"
// };
