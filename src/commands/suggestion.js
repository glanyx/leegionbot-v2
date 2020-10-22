import { Client, Message, User, MessageEmbed } from 'discord.js';
import { Suggestion, SuggestionsMap } from '../handlers/Suggestions';

/**
 * @param {Client} client
 * @param {Message} message
 * @param {Array} args
 */
exports.run = async (client, message, args) => {

  const subcommand = args.splice(0, 1)[0].toLowerCase();

  if (!validateSubcommand(subcommand)) {
    message.channel.send('Couldn\'t recognize that subcommand!')
    return
  }

  if (subcommand === 'add') {
    const embedMessage = await message.channel.send(await createSuggestionEmbed(message.author))
    const suggestion = await new Suggestion(args.join(' '), message.author.id, embedMessage.id, message.guild.id).create()
    embedMessage.edit(await createSuggestionEmbed(message.author, suggestion))
  } else {
    message.channel.send('This is still a W.I.P., sit tight!');
  }

};

exports.help = {
  name: "suggestion",
  category: "Feedback",
  description:
    "Creates, edits, deletes or lists suggestions. You can Edit or Delete your own suggestions. Server Admins can Edit, Delete, Approve or Complete any suggestion. Id must be provided for any command other than Add.",
  usage: "suggestion [add/edit/delete/list/!approve/!complete] (id) [your suggestion]"
};

/**
 * 
 * @param {string} command 
 */
const validateSubcommand = (command) => {
  const options = ['add', 'edit', 'delete', 'list', 'approve', 'complete']
  return options.includes(command.toLowerCase());
}


/**
 * Returns a Discord MessageEmbed with values form the suggestion
 * @param {User} user
 * @param {Suggestion} [suggestion]
 */
const createSuggestionEmbed = async (user, suggestion) => {

  const embed = new MessageEmbed()
    .setAuthor(user.username)
    .setThumbnail(user.avatarURL)
    .setTimestamp()
    .addField('**Author**', user)
    .addField('**Suggestion**', suggestion ? suggestion.description : 'Placeholder')

  if (suggestion) {
    embed
      .addField('**Status**', suggestion.status)
      .setFooter(`ID: ${suggestion.suggestionId}`)
  }

  return embed
}