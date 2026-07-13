// index.js
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { TOKEN, CLIENT_ID, GUILD_ID } = require('./config/config');
const fs = require('node:fs');
const path = require('node:path');

// Crie uma nova instância do cliente Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
});

// Coleções para comandos, eventos, etc.
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();

// --- Carregar Comandos ---
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`[Comando] Carregado: ${command.data.name}`);
    } else {
        console.warn(`[AVISO] O comando em ${filePath} está faltando a propriedade "data" ou "execute" necessária.`);
    }
}

// --- Carregar Eventos ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`[Evento] Carregado: ${event.name}`);
}

// --- Tratamento de Interações ---
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
            return;
        }
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true });
            }
        }
    }
    // Aqui você adicionaria o tratamento para buttons, selectMenus, modals
    // if (interaction.isButton()) { ... }
    // if (interaction.isSelectMenu()) { ... }
    // if (interaction.isModalSubmit()) { ... }
});


// Quando o cliente estiver pronto, execute este código uma vez (apenas no início)
client.once('ready', () => {
    console.log(`Pronto! Logado como ${client.user.tag}`);
});

// Faça o login no Discord com o token do seu cliente
client.login(TOKEN);
