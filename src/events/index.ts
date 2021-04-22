import { ChannelCreate } from './channelCreate'
import { GuildCreate } from './guildCreate'
import { GuildMemberAdd } from './guildMemberAdd'
import { GuildMemberRemove } from './guildMemberRemove'
import { GuildMemberUpdate } from './guildMemberUpdate'
import { Message } from './message'
import { MessageDelete } from './messageDelete'
import { MessageUpdate } from'./messageUpdate'
import { RateLimit } from './rateLimit'
import { Ready } from './ready'
import { UserUpdate } from './userUpdate'
import { Warn } from './warn'

export default [
  ChannelCreate,
  GuildCreate,
  GuildMemberAdd,
  GuildMemberRemove,
  GuildMemberUpdate,
  Message,
  MessageDelete,
  MessageUpdate,
  RateLimit,
  Ready,
  UserUpdate,
  Warn
]