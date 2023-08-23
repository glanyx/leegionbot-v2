import { Shutdown } from './admin'
import { Config } from './configuration'
import { Countdown, Suggestion, Rolegate, Rolemenu, RoleEmoji } from './features'
import { About, Avatar, Info, Ping, User, Rank } from './informational'
// import { Ban, Blacklist, Kick, Modlog, Mute, Purge, Slowmode, Unban, Unmute, Warn } from './moderation'
import { Command } from 'discord.js'
// import { Join, Play, Queue, Skip, Stop } from './music'

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

  // Blacklist,
  // Ban,
  // Unban,
  // Kick,
  // Mute,
  // Unmute,
  // Modlog,
  // Purge,
  // Slowmode,
  // Warn,

  // Join,
  // Play,
  // Queue,
  // Skip,
  // Stop,

]