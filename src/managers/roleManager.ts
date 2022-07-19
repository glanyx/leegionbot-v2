import { Guild, GuildMember, Role } from 'discord.js'
import { logger } from '../utils'

export enum IRoleAction {
  ADD = 'add',
  REMOVE = 'remove'
}

export enum IActionType {
  MUTE = 0,
  JOIN = 1,
  MENU = 2,
  MANUAL = 3,
}

interface IMemberRoleMapper {
  member: GuildMember
  role: Role
  action: IRoleAction
  type: IActionType
  callback?: () => any
  actionId?: string
  time: Date
}

interface IGuildRoleMapping {
  guild: Guild
  queue: Array<IMemberRoleMapper>
  actions: Array<IMemberRoleMapper>
  timer?: NodeJS.Timeout
}

const typeArray = [IActionType.MUTE, IActionType.JOIN, IActionType.MENU, IActionType.MANUAL]

const customSort = (itemA: IMemberRoleMapper, itemB: IMemberRoleMapper) => {
  if (itemA.actionId && itemB.actionId && itemA.actionId === itemB.actionId && itemA.callback) return 1
  if (itemA.actionId && itemB.actionId && itemA.actionId === itemB.actionId && itemB.callback) return -1
  if (itemA.type === itemB.type) return itemA.time.getTime() - itemB.time.getTime()
  return itemA.type - itemB.type
}

export class ClientRoleManager {

  guilds: Map<string, IGuildRoleMapping>

  constructor() {

    this.guilds = new Map<string, IGuildRoleMapping>()

  }

  public add(member: GuildMember, role: Role, action: IRoleAction, type: IActionType, callback?: () => any, actionId?: string) {

    const { guild } = member

    if (!this.guilds.has(guild.id)) this.guilds.set(guild.id, { guild, queue: [], actions: [] })
    const instance = this.guilds.get(guild.id)

    if (!instance) return

    const item: IMemberRoleMapper = {
      member,
      role,
      action,
      type,
      callback,
      actionId,
      time: new Date()
    }

    if (instance.actions.length < 9) {
      (member.roles as any)[action](role)
      this.logAction(item)
      instance.actions.push(item)
      if (item.callback) item.callback()
    } else if (instance.actions.length < 10 && type === IActionType.MUTE) {
      (member.roles as any)[action](role)
      this.logAction(item)
      instance.actions.push(item)
      if (item.callback) item.callback()
    } else {
      instance.queue.push(item)
    }

    if (!instance.timer) this.startTimer(instance)
  }

  public addMultiple(members: Array<GuildMember>, role: Role, action: IRoleAction, type: IActionType, callback?: () => any, actionId?: string) {

    const { guild } = members[0]

    if (!this.guilds.has(guild.id)) this.guilds.set(guild.id, { guild, queue: [], actions: [] })
    const instance = this.guilds.get(guild.id)

    if (!instance) return

    const items: Array<IMemberRoleMapper> = members.map((member, index) => {
      return {
        member,
        role,
        action,
        type,
        actionId,
        callback: index === members.length - 1 ? callback : undefined,
        time: new Date()
      }
    }).sort(customSort)

    const split = instance.actions.length < 10 ? 9 - instance.actions.length : 0

    const actionSet = split > 0 ? items.splice(0, split) : []
    instance.actions = actionSet
    actionSet.forEach(item => {
      (item.member.roles as any)[item.action](item.role).catch(() => logger.error(`Unable to ${item.action} Role ${item.role.name} (ID: ${item.role.id}) | User ${item.member.user.username}#${item.member.user.discriminator} (ID: ${item.member.user.id})`))
      this.logAction(item)
      if (item.callback) item.callback()
    })

    if (items.length > 0) {
      instance.queue.push(...items)
    }
    
    if (!instance.timer) this.startTimer(instance)

  }

  private startTimer(instance: IGuildRoleMapping) {

    const checkQueue = () => {
      instance.actions = []
      if (instance.queue.length > 0) {
        const toAction = instance.queue.sort(customSort).splice(0, 9)
        instance.actions = toAction
        toAction.forEach(item => {
          (item.member.roles as any)[item.action](item.role).catch(() => logger.error(`Unable to ${item.action} Role ${item.role.name} (ID: ${item.role.id}) | User ${item.member.user.username}#${item.member.user.discriminator} (ID: ${item.member.user.id}) | Guild: ${item.member.guild.name} (ID: ${item.member.guild.id})`))
          this.logAction(item)
          if (item.callback) item.callback()
        })
      }
      if (instance.actions.length === 0) {
        if (instance.timer) clearInterval(instance.timer)
        this.guilds.delete(instance.guild.id)
      }
    }

    instance.timer = setInterval(checkQueue, 11000)

  }

  public getQueueCount(guildId: string) {
    const instance = this.guilds.get(guildId)
    if (!instance) return 0
    return instance.queue.length
  }

  private logAction(item: IMemberRoleMapper) {
    logger.debug(`RoleManager | Action: ${item.action} | Type: ${item.type} | User: ${item.member.user.username}#${item.member.user.discriminator} (ID: ${item.member.user.id}) | Guild: ${item.member.guild.name} (ID: ${item.member.guild.id}) | Role: ${item.role.name} (ID: ${item.role.id})`)
  }

}