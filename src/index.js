import config from './config/config';

const Enmap = require("enmap");
const fs = require("fs");

const Discord = require('discord.js');
const client = new Discord.Client();

const twitterHandler = require('./handlers/twitter');

process.title = 'leegionBot';

fs.readdir("./src/events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        client.on(eventName, event.bind(null, client));
    });
});
  
client.commands = new Enmap();

fs.readdir("./src/commands/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        console.log(`Attempting to load command ${commandName}`);
        client.commands.set(commandName, props);
    });
});

client.login(config.token);
const stream = require('./libs/twitter-lib').run();

stream.on('data', event => {
    if (event.user.id !== config.twitter.id){
        return;
    };
    twitterHandler.handler(client, event);
})