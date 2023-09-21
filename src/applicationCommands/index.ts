import SlashCommands from './slashCommands'
import UserContextMenus from './userContextMenus'
import MessageContextMenus from './messageContextMenus'

export default [
  ...SlashCommands,
  ...UserContextMenus,
  ...MessageContextMenus,
]