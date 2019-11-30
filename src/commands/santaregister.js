import * as dynamoDbLib from '../libs/dynamodb-lib';
import config from '../config/config';

exports.run = async (client, message, args) => {

    const profile = {
        tc: false,
        type: "",
        location: null,
        region: null,
        themes: [],
    };

    try {
        profile.tc = await termsAndConditions(message);
        profile.type = await type(message.author);

        // Only grab location if physical tier
        if (profile.type === 'physical'){
            profile.location = await getLocation(message.author);
            profile.region = await getRegion(message.author);
        };

        // Grab themes
        while (themes === []){
            profile.themes = await getThemes(message.author);
        }

        // Store the data provided by the user
        await store(message.author, profile);

        // End registration
        message.author.send({embed: {
            color: 3800852,
            title: '**Success!!**',
            description: `WHOO!! We're all done, ${message.author.username}! Thank you so much for registering for the Leegion Secret Santa event.\n
            There is nothing for you to do right now, so please sit tight. I'll be in touch again when I know who you'll be sending a gift! In the meantime, please spread the Christmas cheer!\n
            If you want to check your profile, please type \`${config.prefix}santaprofile\`! If you're not happy with it or if you want to make some changes, you can re-register by using the \`${config.prefix}santaregister\` command!`
        }});

    } catch (e) {
        message.author.send(e.message);
        message.author.send(`The Secret Santa registration process has been cancelled. If you still want to register, please use the \`santaregister\` command again!`);
    }

}

async function termsAndConditions(message) {

    const user = message.author;

    return new Promise(
        async (resolve, reject) => {

            await user.send(`Hey ${user.username}!\nThanks for registering for the Leegion Secret Santa event. Even a little bot like me must go by the rules, so to continue the registration process, you must agree to the below Terms and Conditions. Please read them carefully and respond to the appropriate emoji to Accept or Decline.`)
            .catch(e => {
                message.channel.send(`I can't DM you, ${message.author}! If you have DMs disabled, please temporarily enable them!`);
                console.log(`Couldn't DM user ${user.tag} - DMs disabled`);
                return;
            });
            user.send({embed: {
                color: 16622136,
                title: 'Terms and Conditions',
                description: `${user.client.user.username}, created by ${await user.client.fetchUser('224606487979360256').then(user => {return user.tag})}, will hereby be approved to receive publically available data from your Discord Profile and any additional information that you send it. Aforementioned data is stored on an AWS server in London and will only be used for the sole purpose of the Leegion Secret Santa event. Your data will only be shared with the bot owner and any Discord user that you are matched with during the event.\n
                **Your data will never be shared with, or sold to additional third parties.**\n
                Neither ${user.client.user.username}, its owner ${await user.client.fetchUser('224606487979360256').then(user => {return user.tag})}, the Leegion Mod team, nor Amanda Lee (known as LeeandLie or Amalee) can be held responsible for any missing items / gifts or any potential unfair balance between gifts sent or gifts received.\n
                By clicking the Green Tick emoji you agree with the above Terms and Conditions. By clicking the Red Cross emoji or allowing this message to time out (3 minutes) you do not agree with the above Terms and Conditions and the registration process will be terminated.`
            }}).then(async message => {
                await message.react('507285695484919809');
                message.react('507287289282428962');
                message.awaitReactions((reaction, userA) => (reaction.emoji.id === '507285695484919809' || reaction.emoji.id === '507287289282428962') && userA === user, {
                    max: 1,
                    time: 180000,
                    errors: ['time']
                }).then(collected => {
                    if (collected.first().emoji.id === '507285695484919809'){
                        resolve(true);
                    } else {
                        reject(new Error('You declined the T&C!'));
                    }
                }).catch(() => {
                    reject(new Error('The message timed out.'));
                });
            }).catch(() => {
                return;
            });
        }
    );
};

async function type(user) {

    return new Promise(
        async (resolve, reject) => {

            user.send(`It's great to have you aboard, ${user.username}!\nWith that out of the way, I just need to ask you a few questions to finalize the registration process. This event is separated into 3 different 'tiers'; Free, Digital and Physical. This is so that people with different interests can still exchange gifts with one another. We do have some guidelines around the different tiers, so please make note of the following:`)
            user.send({embed: {
                color: 16622136,
                title: 'Gift Tiers',
                description: `**Free Tier**
                **Price Estimation**:
                    FREE
                **Description**:
                    The Free tier will include gifts such as digital art or a recording. This tier was primarily made available for those amongst us who would like to participate but are unable to provide a monetary contribution. If you have that artistic gene or if you have no money to spend during the expensive Christmas period, this is the Tier for you.\n
                **Digital Tier**
                **Price Estimation**:
                    $10
                **Description**:
                    The Digital tier more or less speaks for itself. This can include gift codes for things such as e-books, games or even commissioned work. If finding a physical gift is simply too much work for you or if you are worried about sharing your personal address, you'll want to opt in for Digital.\n
                **Physical Tier**
                **Price Estimation**:
                    $20
                **Description**:
                    The Physical tier is for those wanting to go above and beyond, participating to the full extent in the spirit of giving. You will be buying an actual, physical gift for a random recipient and mail it to them by post. You will be matched with someone in roughly the same area to keep shipping costs to a minimal. Please note that in order to proceed with the registration for the Physical tier, I WILL need your physical address.`
            }});
            user.send(`Please type either \`free\`, \`digital\` or \`physical\`, based on the tier you would like to opt in for.`)
            .then(message => {
                const collector = message.channel.createMessageCollector(message => user === message.author, {
                    time: 180000
                });

                collector.on('collect', m => {
                    if (m.content.toLowerCase().includes('free')) {
                        collector.stop();
                        resolve('free');
                    } else if (m.content.toLowerCase().includes('digital')) {
                        collector.stop();
                        resolve('digital');
                    } else if (m.content.toLowerCase().includes('physical')) {
                        collector.stop();
                        resolve('physical');
                    } else {
                        user.send(`I couldn't recognize that Tier. Please try again.`);
                    }
                });
                
            }).catch(e => {
                reject(new Error('The message timed out.'));
            });
        }
    );
};

async function getLocation (user) {
    return new Promise(
        async (resolve, reject) => {

            user.send(`Nice! Now that I've got you written down for the Physical tier, I need to ask you for your physical address so that you may receive a gift from your Secret Santa, exciting! Please type your FULL address to me the same way as you would put on a letter.\nHint: You can use the Shift + Enter keys on your keyboard to create a new line without sending me your message!`
            ).then(message => {
                const collector = message.channel.createMessageCollector(message => user === message.author, {
                    time: 300000
                });

                collector.on('collect', async m => {
                    await confirmInput(user, m.content, 'Is this the right address?')
                        .then(() => {
                            collector.stop();
                            resolve(m.content);
                        }).catch(e => {
                            console.log(`Location Confirmation rejected by user.`);
                            console.log(e);
                        })
                });
                
            }).catch(e => {
                reject(new Error('The message timed out.'));
            });
        }
    );
}

async function getRegion (user) {
    return new Promise(
        async (resolve, reject) => {

            user.send(`To match you with a Secret Santa, I'll need a rough region of where you live. I'm not smart enough (yet) to figure this out myself, so please give me a hand!\nThe options are:
            Europe
            North America
            South America
            Canada
            Asia
            Australia
            Middle East
            Africa`
            ).then(message => {
                const collector = message.channel.createMessageCollector(message => user === message.author, {
                    time: 180000
                });

                async function regionConfirm(user, region){
                    const regionArray = {
                        'eu': 'Europe',
                        'na': 'North America',
                        'sa': 'South America',
                        'ca': 'Canada',
                        'as': 'Asia',
                        'au': 'Australia',
                        'me': 'Middle East',
                        'af': 'Africa',
                    }
                    
                    await confirmInput(user, regionArray[region], `You have chosen the following Region. Is this correct?`)
                        .then(() => {
                            collector.stop();
                            resolve(region);
                        }).catch(e => {
                            console.log(`Region Confirmation rejected by user.`);
                            console.log(e);
                        });
                }

                collector.on('collect', async m => {
                    if (m.content.toLowerCase().includes('europe') || m.content.toLowerCase() === 'eu') {
                        await regionConfirm(user, `eu`);
                    } else if (m.content.toLowerCase().includes('north america') || m.content.toLowerCase() === 'na' || m.content.toLowerCase().includes('usa')) {
                        await regionConfirm(user, `na`);
                    } else if (m.content.toLowerCase().includes('south america') || m.content.toLowerCase() === 'sa') {
                        await regionConfirm(user, `sa`);
                    } else if (m.content.toLowerCase().includes('canada') || m.content.toLowerCase() === 'ca') {
                        await regionConfirm(user, `ca`);
                    } else if (m.content.toLowerCase().includes('asia') || m.content.toLowerCase() === 'as') {
                        await regionConfirm(user, `as`);
                    } else if (m.content.toLowerCase().includes('australia') || m.content.toLowerCase().includes('aus') || m.content.toLowerCase() === 'au') {
                        await regionConfirm(user, `au`);
                    } else if (m.content.toLowerCase().includes('middle east') || m.content.toLowerCase() === 'me') {
                        await regionConfirm(user, `me`);
                    } else if (m.content.toLowerCase().includes('africa') || m.content.toLowerCase() === 'af') {
                        await regionConfirm(user, `af`);
                    } else {
                        user.send(`I couldn't recognize that Region. Please try again.`);
                    }
                });
                
            }).catch(e => {
                reject(new Error('The message timed out.'));
            });
        }
    );
}

async function getThemes (user) {

    let themes = [];

    return new Promise(
        async (resolve, reject) => {

            user.send(`We're almost there! We don't want to make this really difficult for your Secret Santa and we'd like you to receive a gift you would like. Please share with me a maximum of 3 themes that you would like to receive a gift for. You must add at least 1 theme, but if you can't think of 3, don't worry, you can finish this part of the registration process by typing \`done\`.\n\nPlease send me each theme as a **NEW** message!`
            ).then(message => {
                const collector = message.channel.createMessageCollector(message => user === message.author, {
                    max: 3,
                    time: 300000
                });

                collector.on('collect', m => {
                    if (m.content.toLowerCase() === 'done'){
                        collector.stop();
                    } else {
                        themes.push(m.content);
                    }
                });

                collector.on('end', () => {
                    resolve(themes);
                });
                
            }).catch(e => {
                reject(new Error('The message timed out.'));
            });
        }
    );
}

async function confirmInput (user, input, prompt) {
    return new Promise(
        async (resolve, reject) => {

            user.send(prompt);
            user.send({embed: {
                color: 16622136,
                description: input
            }}).then(async message => {
                await message.react('507285695484919809');
                message.react('507287289282428962');
                message.awaitReactions((reaction, userA) => reaction.emoji.id === '507285695484919809' && userA === user, {
                    max: 1,
                    time: 180000,
                    errors: ['time']
                }).then(collected => {
                    if (collected.first().emoji.id === '507285695484919809'){
                        resolve(true);
                    } else {
                        reject(new Error('Rejected address'));
                    }
                }).catch(e => {
                    reject(new Error('The message timed out.'));
                });
            });
        }
    );
}

async function store (user, profile) {

    return new Promise(
        async (resolve, reject) => {
            const params = {
                TableName: "santaprofile",
                Item: {
                    userId: user.id,
                    type: profile.type,
                    address: profile.location,
                    region: profile.region,
                    themes: profile.themes.join(),
                    createdAt: Date.now()
                }
            };

            try{
                await dynamoDbLib.call("put", params);
                resolve(true);
            } catch (e) {
                console.log(e);
                reject(new Error(`Oops, it seems I can't store your data right now. Please try again in a minute or contact my owner!`));
            }
        }
    )
}