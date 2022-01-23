require('dotenv').config()
const fs = require('fs');

const Discord = require('discord.js')
const client = new Discord.Client({
  allowedMentions: { parse: [] },
  intents: [
      Discord.Intents.FLAGS.GUILDS,
      Discord.Intents.FLAGS.GUILD_MESSAGES,
      Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ]
});
const { Collection } = require('discord.js')
const commandlist = []
const token = process.env.token
const prefix = "!"

let discordList = [];
client.commands = new Collection();
client.commandlist = discordList;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands1 = [];
const commandFiles1 = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles1) {
	const command = require(`./commands/${file}`);
	commands1.push(command.data.toJSON());
}



fs.readdir('./commands/', async (err, files) => {
  if(err){
      return console.log('An error occured when checking the commands folder for commands to load: ' + err);
  }
  files.forEach(async (file) => {
      if(!file.endsWith('.js')) return;
      let commandFile = require(`./commands/${file}`);
      discordList.push({
        file: commandFile,
        name: file.split('.')[0],
        config: commandFile.config
      });
  });
});


const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
            Routes.applicationCommands(process.env.client),
			{ body: commands1 },
		);
        console.log(commands1)

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();





client.on('ready', () => {
  console.log(`The discord bot logged in! Username: ${client.user.username}!`)
})







client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.exec(client,interaction)
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});




client.login(process.env.token)