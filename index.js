var stdin = process.openStdin();
const {Collection} = require(`discord.js`)
const fs = require(`fs`)
let chalk = require(`chalk`)
let testServer = "5436457651234264";
stdin.addListener("data", function (d) {
			let text = d.toString().trim()
			let args = text.split(" ")
			let command = args.shift()
			if (command === "reload") {
				if (args[0] === "commands") {
					const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));

					for (const file of commandFiles) {
						delete require.cache[require.resolve(`../cmds/${file}`)];
					}
					loadCommands(client)
				} else if (args[0] === "events") {
					for (const event of client.eventNames()) {
						client.removeAllListeners(event);
					}
					loadEvents(client)
					console.log(chalk.green(`Successfully reloaded events!`))
				} else {
          const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));

					for (const file of commandFiles) {
						delete require.cache[require.resolve(`../cmds/${file}`)];
					}
					loadCommands(client)

          for (const event of client.eventNames()) {
						client.removeAllListeners(event);
					}
					loadEvents(client)
					console.log(chalk.green(`Successfully reloaded commands & events!`))
				}
			}
		});


function loadCommands(client) {
    client.commands = new Collection()
    let data = [];
    let guild = [];

    const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));

    const array = []

    for (const file of commandFiles) {
        let command = require(`../cmds/${file}`);
        if (command.testOnly) {
            guild.push({
                name: command.name ? command.name : file.split(".")[0],
                description: command.description ? command.description : "No description.",
                options: command.options ? command.options : [],
            });
            client.commands.set(command.name, command)
            array.push({myId: `${command.name}`, status: `enabled`})
        } else {
            data.push({
                name: command.name ? command.name : file.split(".")[0],
                description: command.description ? command.description : "No description.",
                options: command.options ? command.options : [],
            });
            client.commands.set(command.name, command)
            array.push({myId: `${command.name}`, status: `enabled`})
        }
    }
    if (!data && !guild) return console.log(`You don't have any command.`)
    if (data) client.application.commands.set(data)
    if (guild) {
        client.guilds.cache.get(testServer).commands.set(guild)
    }

    const transformed = array.reduce((acc, {myId, ...x}) => { acc[myId] = x; return acc}, {})

    console.table(transformed)
}

function loadEvents(client) {
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const event = require(`../events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}
