import Discord from 'discord.js';

function run (client, message, args){
    const embed = new Discord.RichEmbed()
        .setTitle("Test")
        .setImage("https://i.giphy.com/3ov9k0DUDgjUOxZZja.gif");

    message.channel.send(embed);
}

export default run;