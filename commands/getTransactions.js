var Tx = require("ethereumjs-tx");
const { SlashCommandBuilder } = require("discord.js");
const { Web3 } = require("web3");
//const { contractABI, contractAddress } = require("../src/utils/constants");
const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "createStorageContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnerSet",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "number",
        type: "uint256",
      },
    ],
    name: "setNumber",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getNumber",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const contractAddress = "0x2d6A488A224714883C264C337660ca2E84290C46";
const web3 = new Web3(
  "https://sepolia.infura.io/v3/be220c4901f3479f93874cc90c305220"
);
const account1 = "0x9a14bcdD6202f942fbE274A8087873F0BB00231e";
web3.eth.defaultAccount = account1;

const privateKey1 = Buffer.from(
  "d975ed73f92e4fad1d74ab58946b696d56d57a5ce43ff7ebe67ad25121ce587f",
  "hex"
);

const createEthereumContract = () => {
  const transactionsContract = new web3.eth.Contract(abi, contractAddress);
  return transactionsContract;
};

//const myData = myContract.methods.greet("hello blockchain devs").encodeABI();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gettrans")
    .setDescription("Displays Transactions!"),
  async execute(interaction) {
    try {
      const transactionsContract = createEthereumContract();
      const myData = transactionsContract.methods.setNumber(34).encodeABI();

      web3.eth.getTransactionCount(
        account1,
        "pending",
        async (err, txCount) => {
          // Build the transaction
          const txObject = {
            nonce: web3.utils.toHex(txCount),
            to: contractAddress,
            value: web3.utils.toHex(web3.utils.toWei("0", "ether")),
            gasLimit: web3.utils.toHex(2100000),
            gasPrice: web3.utils.toHex(web3.utils.toWei("6", "gwei")),
            data: myData,
          };

          // Sign the transaction
          const tx = new Tx(txObject);
          tx.sign(privateKey1);

          const serializedTx = tx.serialize();
          const raw = "0x" + serializedTx.toString("hex");

          // Broadcast the transaction
          const receipt = await web3.eth.sendSignedTransaction(raw);
          console.log("Transaction receipt:", receipt);
        }
      );

      await interaction.reply("Transactions retrieved. Check the console.");
    } catch (error) {
      console.log(error);
      await interaction.reply(
        "Error fetching transactions. Check the console for details."
      );
    }
  },
};

const getNumber = async () => {
  const transactionsContract = createEthereumContract();
  const owner = await transactionsContract.methods.getNumber().call();
};
