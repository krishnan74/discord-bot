const { Client, IntentsBitField, Events, Collection } = require("discord.js");
const sharp = require("sharp");
const fs = require("node:fs");

const path = require("node:path");
require("dotenv").config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "../commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

const getCatDetails = async () => {
  try {
    const response = await fetch("https://meowfacts.herokuapp.com/");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching cat details:", error.message);
    return null;
  }
};

const getPNGContentFromURL = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error("Error fetching PNG: ", error.message);
    return null;
  }
};

const getNFTs = async (accountAddress, chain) => {
  try {
    const response = await fetch(
      `https://api.opensea.io/api/v2/chain/${chain}/account/${accountAddress}/nfts`,
      {
        headers: {
          "x-api-key": process.env.OPEN_SEA_APIKEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const imageUrls = await Promise.all(
      data.nfts.map((nft) => getPNGContentFromURL(nft.image_url))
    );
    return imageUrls;
    //const svgContent = await getPNGContentFromURL(data.nfts.image_url);
  } catch (error) {
    console.error("Error fetching nft details:", error);
    return null;
  }
};

client.on("messageCreate", async (msg) => {
  if (msg.content === "Fetching NFT's") {
    try {
      var NFTMsg = await getNFTs(
        "0x20099eb8dedb9617fa058f8a3479ce09f417b00c",
        "ethereum"
      );

      //const pngBuffer = await sharp(Buffer.from(svgContent)).png().toBuffer();
      const files = NFTMsg.slice(0, 5).map((image, index) => ({
        attachment: image,
        name: `image_${index + 1}.png`,
      }));

      msg.channel.send({
        files: files,
      });
    } catch (error) {
      console.error("Error in messageCreate event:", error.message);
    }
  }

  
});

client.on("ready", (c) => {
  console.log(c.user.tag);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
