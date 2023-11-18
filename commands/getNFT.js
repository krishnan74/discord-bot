const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("getnft")
    .setDescription("Displays NFT's!"),
  async execute(interaction) {
    await interaction.reply("Fetching NFT's");
  },
};
