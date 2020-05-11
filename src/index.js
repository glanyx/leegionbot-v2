import config from './config/config';
import * as TwitterLib from './libs/twitter-lib';

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
let stream = TwitterLib.run();

stream.on('data', event => {
  if (event.user.id !== config.twitter.id){
    return;
  };
  twitterHandler.handler(client, event);
});

stream.on('error', e => {
  console.log(e);
  client.guilds['259715388462333952'].channels.get('259715388462333952').send('Twitter Error:');
  client.guilds['259715388462333952'].channels.get('259715388462333952').send(e);
});

stream.on('disconnect', e => {
  client.guilds['259715388462333952'].channels.get('259715388462333952').send('Twitter Disconnect:');
  client.guilds['259715388462333952'].channels.get('259715388462333952').send(e);
  stream = TwitterLib.run();
})