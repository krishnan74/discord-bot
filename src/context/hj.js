const { ethers } = require("ethers");
const { contractABI, contractAddress } = require("../utils/constants");
const { Client } = require("discord.js");

const client = new Client();
const prefix = "/"; // Set your desired command prefix

const createEthereumContract = () => {
  // Assuming you have an Ethereum provider available
  const provider = new ethers.providers.JsonRpcProvider("YOUR_ETH_NODE_URL");
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return transactionsContract;
};

client.on("message", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "gettransactions") {
      try {
        const transactionsContract = createEthereumContract();
        const availableTransactions =
          await transactionsContract.getAllTransactions();

        const structuredTransactions = availableTransactions.map(
          (transaction) => ({
            addressTo: transaction.receiver,
            addressFrom: transaction.sender,
            timestamp: new Date(
              transaction.timestamp.toNumber() * 1000
            ).toLocaleString(),
            message: transaction.message,
            keyword: transaction.keyword,
            amount: parseInt(transaction.amount._hex) / 10 ** 18,
          })
        );

        console.log(structuredTransactions);
        message.reply("Transactions retrieved. Check the console.");
      } catch (error) {
        console.error(error);
        message.reply(
          "Error fetching transactions. Check the console for details."
        );
      }
    }
    // Add more commands as needed...
  }
});

client.login("YOUR_BOT_TOKEN");
