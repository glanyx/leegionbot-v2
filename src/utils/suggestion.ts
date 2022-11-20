import { EmbedBuilder, User } from 'discord.js'
import { Suggestion } from '../db/models'

export enum SuggestionStatus {
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  DECLINED = 'declined'
}

export const SuggestionState = {
  FINAL: [SuggestionStatus.COMPLETED, SuggestionStatus.DECLINED],
  PENDING: [SuggestionStatus.SUBMITTED, SuggestionStatus.APPROVED]
}

interface SuggestionArgs {
  user?: User,
  editor?: User,
  mod?: User,
  suggestion: Suggestion
}

export const updateSuggestion = (args: SuggestionArgs) => {

  const { user, suggestion } = args

  const embed = new EmbedBuilder()
    .setTitle(`Suggestion by ${ user ? `${user.username}#${user.discriminator}` : `${suggestion.userId}` }`)
    .setDescription(suggestion.updatedText || suggestion.text)
    .setFooter({ text: `Suggestion ID: ${suggestion.id}` })
    .addFields({
      name: 'Status',
      value: `${suggestion.status.capitalize()}`,
      inline: true
    }, {
      name: 'Author',
      value: user ? `${user}` : `${suggestion.userId}`,
      inline: true
    })

  if (args.editor) embed.addFields({
    name: `Edited by`,
    value: `${args.editor}`,
    inline: true
  })
  if (args.mod) embed.addFields({
    name: `${args.suggestion.status.capitalize()} by`,
    value: `${args.mod}`,
    inline: true
  })
  if (args.suggestion.reason) embed.addFields({
    name: 'Comment',
    value: args.suggestion.reason
  })

  switch (args.suggestion.status) {
    case SuggestionStatus.SUBMITTED:
      embed.setColor('#AAAAAA')
      break
    case SuggestionStatus.APPROVED:
      embed.setColor('#FFA500')
      break
    case SuggestionStatus.COMPLETED:
      embed.setColor('#00FF00')
      break
    case SuggestionStatus.DECLINED:
      embed.setColor('#FF0000')
      break
    default:
      embed.setColor('#AAAAAA')
  }

  return embed
}