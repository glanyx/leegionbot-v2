import { EmbedBuilder, GuildMember, ColorResolvable, CommandInteraction } from "discord.js"
import { logger } from './'

abstract class ModAction {

  protected interaction: CommandInteraction
  protected shortActionText: string = ''
  protected actionText: string = ''
  protected colour: ColorResolvable = '#ffffff'
  protected user: GuildMember
  protected target: GuildMember
  protected reason: string = 'No reason provided'

  constructor(interaction: CommandInteraction, user: GuildMember, target: GuildMember, reason?: string) {
    this.interaction = interaction
    this.user = user
    this.target = target
  }

  protected notifyUser = () => {
    return this.target.send(`You were ${this.actionText} from ${this.target.guild.name}.\n\nReason:\n${this.reason}`)
  }

  protected notifyGuild = async (success: boolean = true) => {

    if (!success) return this.interaction.editReply(`Unable to ${this.shortActionText} user.`)

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${this.target.user.username} [ID: ${this.target.user.id}]`, iconURL: this.target.user.displayAvatarURL() })
      .setDescription(`This user has been ${this.actionText}.`)
      .addFields({
        name: 'User',
        value: `${this.target}`,
        inline: true,
      }, {
        name: 'Actioned by',
        value: `${this.user}`,
        inline: true,
      }, {
        name: 'Reason',
        value: this.reason,
      })
      .setTimestamp()
      .setColor(this.colour)
  }

  protected execute = (action: Promise<any>) => {

    return new Promise<boolean>((resolve, reject) => {

      this.notifyUser().then(userMsg => {

        action.then(() => {
          resolve(true)
        }).catch(e => {
          logger.debug(`Unable to ${this.shortActionText} target user. ID: ${this.target.id} | Guild ID ${this.target.guild.id}`)
          userMsg.delete()
          reject(`${this.shortActionText.toUpperCase()}_FAILURE`)
        })

      }).catch(e => {
        logger.debug(`Unable to message target user for ${this.shortActionText}. ID: ${this.target.id} | Guild ID ${this.target.guild.id}`)
        action.then(() => {
          resolve(true)
        }).catch(e => {
          logger.debug(`Unable to ${this.shortActionText} target user. ID: ${this.target.id} | Guild ID ${this.target.guild.id}`)
          reject(`${this.shortActionText.toUpperCase()}_FAILURE`)
        })
      })
    }).then(() => {
      this.notifyGuild()
    }).catch(e => {
      this.notifyGuild(false)
    })

  }

}

export class Ban extends ModAction {

  constructor(interaction: CommandInteraction, user: GuildMember, target: GuildMember, reason?: string) {
    super(interaction, user, target, reason)
    this.actionText = 'banned'
    this.shortActionText = 'ban'
  }

  public action = () => {
    this.execute(this.target.ban())
  }

}

export class Kick extends ModAction {

  constructor(interaction: CommandInteraction, user: GuildMember, target: GuildMember, reason?: string) {
    super(interaction, user, target, reason)
    this.actionText = 'kicked'
    this.shortActionText = 'kick'
  }

  public action = () => {
    this.execute(this.target.kick())
  }

}