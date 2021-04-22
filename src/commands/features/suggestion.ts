import { TextChannel } from "discord.js"
import { Help, Config, IExecuteArgs } from "discord.js"
import { Suggestion as SuggestionModel, GuildSetting } from '../../db/models'
import { updateSuggestion } from '../../utils'


const configs: Config = {
  permissions: [
    'SEND_MESSAGES'
  ]
}

const help: Help = {
  name: "suggestion",
  category: "Features",
  description: "Creates a new suggestion.",
  usage: "suggestion [Text]",
  example: [
    'suggestion This is my suggestion!',
  ]
}

const alias = ['sg', 'suggest']

export class Suggestion {

  public static async run({
    message,
    content
  }: IExecuteArgs) {

    const { guild, author } = message
    if (!guild) return

    if (!content || content === '') return message.channel.send('Please add some text for your suggestion!').then(msg => msg.delete({ timeout: 5000 }))

    const settings = await GuildSetting.fetchByGuildId(guild.id)
    const channel = (settings && settings.suggestionChannelId ? await guild.channels.cache.get(settings.suggestionChannelId)?.fetch() || message.channel : message.channel) as TextChannel

    SuggestionModel.addSuggestion({
      guildId: guild.id,
      channelId: channel.id,
      text: content,
      userId: author.id
    }).then(suggestion => {
      channel.send(updateSuggestion({
        user: author,
        suggestion
      })).then(msg => suggestion.setMessageId(msg.id).update())
      message.channel.send(`Thanks for your suggestion, <@${author}>! You can find your suggestion in <#${channel}>`)
    })

  }

  public static get subcommands() {
    return [Add]
  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

  public static get alias() {
    return alias
  }
}

const addHelp: Help = {
  name: "add",
  category: "Features",
  description: "Creates a new suggestion.",
  usage: "suggestion add [Text]",
  example: [
    'suggestion add This is my suggestion!',
  ]
}

const addConfigs: Config = {
  permissions: [
    'SEND_MESSAGES'
  ]
}

const addAlias = ['a']

class Add {

  public static async run(props: IExecuteArgs) {

    Suggestion.run(props)

  }

  public static get help() {
    return addHelp
  }

  public static get configs() {
    return addConfigs
  }

  public static get alias() {
    return addAlias
  }

}