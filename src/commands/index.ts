import { Shutdown } from './admin'
import { Config } from './configuration'
import { Countdown, Suggestion, Rolegate, RoleEmoji } from './features'
import { About, Avatar, Info, Ping, User } from './informational'
import { Ban, Blacklist, Kick, Modlog, Mute, Purge, Slowmode, Unban, Unmute, Warn } from './moderation'
import { Close, Reply, AClose, AReply } from './tickets'
import { Command } from 'discord.js'
// import { Join, Play, Queue, Skip, Stop } from './music'

import { Help } from './help'

export const Commands: Array<Command> = [
  Shutdown,
  
  Config,

  Countdown,
  Suggestion,
  Rolegate,
  RoleEmoji,

  About,
  Avatar,
  Info,
  Ping,
  User,

  Ban,
  Unban,
  Blacklist,
  Kick,
  Modlog,
  Mute,
  Unmute,
  Purge,
  Slowmode,
  Warn,

  Close,
  Reply,
  AClose,
  AReply,

  // Join,
  // Play,
  // Queue,
  // Skip,
  // Stop,

  Help,
]