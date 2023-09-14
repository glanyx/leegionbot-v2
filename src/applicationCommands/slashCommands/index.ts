import { Sync, Rolesync } from './admin'
import { Birthday, Dadjoke, Wyr } from './fun'
import { Ping, Levels, User, Rank } from './informational'
import { Close, Log, Reply, Setup, Ticket } from './ticket'
import { Ban, Kick, Mute, Unban, Unmute, Warn, Note, Modlog, Purge, Slowmode } from './moderation'

export default [
  // Ticket
  Close,
  Log,
  Reply,
  Setup,
  Ticket,

  // Fun
  Birthday,
  Dadjoke,
  Wyr,

  // Admin
  Sync,
  Rolesync,

  // Info
  Rank,
  Levels,
  Ping,
  User,

  // Moderation
  Ban,
  Kick,
  Mute,
  Unban,
  Unmute,
  Warn,
  Note,

  Modlog,
  Purge,
  Slowmode,
]