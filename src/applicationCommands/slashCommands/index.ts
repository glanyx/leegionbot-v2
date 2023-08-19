import { Sync } from './admin'
import { Ping, Levels, User, Rank } from './informational'
import { Close, Log, Reply, Setup, Ticket } from './ticket'
import { Ban, Kick, Mute, Unban, Unmute, Warn } from './moderation'

export default [
  // Ticket
  Close,
  Log,
  Reply,
  Setup,
  Ticket,

  // Admin
  Sync,

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
]