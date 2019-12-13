import { User } from 'discord.js';

exports.run = async (client, message, args) => {

    const santa = message.author;
    const gift = {
        item: [],
        type: null,
        message: '',
        confirmed: false,
    }

    try{
        while (!gift.confirmed) {
            gift.item = getCodes(santa);
            gift.type = await getType(santa);
            gift.message = await getMessage(santa);
            gift.confirmed = await confirmInput(gift);
        }
    } catch(e) {
        console.log(e);
        santa.send(e.message);
        return;
    }

}

/**
 * 
 * @param {User} user 
 * @returns {string|string[]}
 */
function getCodes(user){
    getInput(user, "Ready to send your gift? Great! Please send me your gift code or a URL to the gift.\nIf you have more than 1 gift to send, please send all in a single message with each item separated by a comma \`,\`!")
        .then(collected => {
            return collected;
        })
        .catch(e => {
            throw new Error(e.message);
        });
}

/**
 * 
 * @param {User} user 
 * @returns {string|string[]}
 */
function getType(user){
    getInput(user, "What type of gift are you sending?")
        .then(collected => {
            return collected;
        })
        .catch(e => {
            throw new Error(e.message);
        });
}

/**
 * 
 * @param {User} user 
 * @returns {string|string[]}
 */
function getMessage(user){
    getInput(user, "Do you want to send a message with your gift?")
        .then(collected => {
            return collected;
        })
        .catch(e => {
            throw new Error(e.message);
        });
}

/**
 * 
 * @param {User} user - Discord user instance. 
 * @returns {Promise<string|string[]>} - Returns a promise based on the Discord MessageCollector.
 */
function getInput(user, msg){
    return new Promise(
        (resolve, reject) => {

            user.send(msg)
                .then(message => {
                    const collector = message.channel.createMessageCollector(message => user === message.author, {
                        time: 180000,
                        max: 1,
                        errors: ['time']
                    });

                    collector.on('collect', async m => {
                        resolve(m.split(',').map(str => str.trim()));
                    });
                    
                }).catch(e => {
                    reject(new Error('The message timed out.'));
                    console.log(e);
                });
        }
    );
}

/**
 * Send a confirmation request to a user based on Discord reactions.
 * @param {User} user - Instance of a Discord User.
 * @param {string|string[]} input - Content originally sent by the user.
 * @param {string} [prompt='Is this correct?'] - Message to send to the user.
 * @returns {Promise<boolean>} - Returns a boolean Promise based on the user's confirmation or rejection of the input.
 */
function confirmInput (user, input, prompt) {
    return new Promise(
        (resolve, reject) => {

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
                        resolve(false);
                    }
                }).catch(e => {
                    reject(new Error('The message timed out.'));
                });
            });
        }
    );
}

