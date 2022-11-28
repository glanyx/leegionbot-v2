import { CommandInteraction, GuildChannel, GuildMember } from 'discord.js'

enum ActionType {
  NOTE = 'note',
  WARN = 'warn',
  MUTE = 'mute',
  KICK = 'kick',
  BAN = 'ban',
}

interface ModActionArgs {
  actionType: ActionType
  interaction: CommandInteraction
  logChannel?: GuildChannel
}

class ModAction {

  private actionType: ActionType

  constructor({
    actionType
  }: ModActionArgs) {
    this.actionType = actionType
    this.helper[actionType]()
  }

  private note = () => {

  }

  private warn = () => {

  }

  private mute = () => {

  }

  private kick = () => {

  }

  private ban = () => {

  }

  private sendToLog = (channel: GuildChannel) => {

  }

  private messageMember = (member: GuildMember) => {

  }

  private helper: { [K: string]: Function } = {
    note: this.note,
    warn: this.warn,
    mute: this.mute,
    kick: this.kick,
    ban: this.ban,
  }

}

export class Note extends ModAction {

  constructor() {
    super({ actionType: ActionType.NOTE })
  }

}