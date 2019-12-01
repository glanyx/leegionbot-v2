exports.run = async (client, message, args) => {
    client.fetchApplication().then(application => {
        message.channel.send({embed: {
            title: 'Help',
            description: `Sorry, this is still being setup! In the meantime, if you have any issues or suggestions, visit my [Github Issue Page](https://github.com/glanyx/leegionbot-v2/issues/new/choose)!`
        }});
    });
}