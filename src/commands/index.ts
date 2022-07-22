import { Shutdown } from './admin'
import { Config } from './configuration'
import { Countdown, Suggestion, Rolegate, Rolemenu, RoleEmoji } from './features'
import { About, Avatar, Info, Ping, User, Rank } from './informational'
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
  Rolemenu,
  RoleEmoji,

  About,
  Avatar,
  Info,
  Ping,
  User,
  Rank,

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