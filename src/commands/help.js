import { Client } from "discord.js";
import config from "../config/config";

/**
 * @param {Client} client
 */
exports.run = async (client, message, args) => {
  const commands = client.commands;
  const commandList = commands.keyArray();

  // standalone command
  if (!args[0]) {
    const longest = commandList.reduce(
      (long, str) => Math.max(long, str.length),
      0
    );

    let output = `= Command List =\n\n[Use ${config.prefix}help <commandname> for details]\n`;
    const sorted = commands
      .array()
      .sort((p, c) =>
        p.help.category > c.help.category
          ? 1
          : p.help.name > c.help.name && p.help.category === c.help.category
          ? 1
          : -1
      );

    let curCategory;
    sorted.forEach(c => {
      const category = c.help.category;
      if (curCategory !== category) {
        output += `\u200b\n= ${category} =\n`;
        curCategory = category;
      }
      output += `${config.prefix}${c.help.name}${" ".repeat(
        (longest - c.help.name.length)
      )} :: ${c.help.description}\n`;
    });
    message.channel.send(output, {
      code: "asciidoc",
      split: { char: "\u200b" }
    });
  } else {
    if (commands.has(args[0])) {
      const command = commands.get(args[0]);
      message.channel.send(
        `= ${command.help.name} =\n${command.help.description}\nUsage:: ${command.help.usage}`,
        { code: "asciidoc" }
      );
    }
  }
};

exports.help = {
  name: "help",
  category: "System",
  description: "Displays all available commands.",
  usage: "help [command]"
};
