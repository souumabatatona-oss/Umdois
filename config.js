// config/config.js
require('dotenv').config();

module.exports = {
    TOKEN: process.env.TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    GUILD_ID: process.env.GUILD_ID // Para comandos slash globais/específicos de guild
};
