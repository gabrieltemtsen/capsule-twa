/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { Redis } from "@upstash/redis";
import { ethers } from "ethers";
import { CapsuleEthersSigner } from "@usecapsule/ethers-v6-integration";

const TelegramBot = require('node-telegram-bot-api');

const CAPSULE_ENV: Environment = process.env.VITE_CAPSULE_ENV as Environment;
const capsule = new CapsuleServer(CAPSULE_ENV, process.env.VITE_CAPSULE_API_KEY);
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const botName = "Fuse x Gabe2.0";
let bot: typeof TelegramBot | null = null;

const initializeBot = () => {
  if (bot) {
    console.log('Bot is already initialized');
    return bot;
  }

  console.log('Initializing Telegram Bot Service');
  const TELEGRAM_TOKEN = process.env.NEXT_PUBLIC_ENV === 'development'
    ? process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN_DEV
    : process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;

  if (!TELEGRAM_TOKEN) {
    throw new Error('TELEGRAM_TOKEN is not defined');
  }

  bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

  bot.on('polling_error', (error: any) => console.error('Polling error:', error));

  bot.on("message", async (message: any) => {
    const chatId = message.chat.id;
    const telegramId = message.from.id;
  
    if (!message.text?.startsWith("/")) {
      return handleNaturalLanguageQuery(message);
    }
  
    try {
      console.log("Message received:", message.text);
  
      // Check user session in Redis
      const userSession: any = await redis.get(`capsule:user:${telegramId}`);
      if (!userSession) {
        console.warn(`No session found for Telegram ID ${telegramId}`);
        return sendActivationLink(chatId, "Your session is inactive. Please activate the bot:");
      }
  
      try {
        // Import session and check if it's active
        await capsule.importSession(userSession);
        const isSessionActive = await capsule.keepSessionAlive();
  
        if (!isSessionActive) {
          console.warn(`Session expired for Telegram ID ${telegramId}`);
          await capsule.refreshSession(true);  // Attempt to refresh the session
          return sendActivationLink(chatId, "Your session has expired. Please reactivate the bot:");
        }
      } catch (sessionError) {
        console.error("Session handling error:", sessionError);
        return sendActivationLink(chatId, "An error occurred while managing your session. Please reactivate the bot.");
      }
  
      // Handle commands
      const command = message.text.split(" ")[0].toLowerCase();
      switch (command) {
        case "/balance":
          return await handleBalance(chatId);
  
        case "/address":
          return await handleAddress(chatId);
  
        case "/history":
          return await handleTransactionHistory(chatId);
  
        case "/transfer":
          return await handleTransferCommand(chatId, message.text);
  
        case "/info":
          return bot.sendMessage(
            chatId,
            `I'm ${botName}, your wallet assistant bot. I can help with balance checks, transaction history, and automation tasks.\n\nCommands:\n` +
            "/balance - Check your wallet balance\n" +
            "/address - Get your wallet address\n" +
            "/history - View your recent transaction history\n" +
            "/transfer <toAddress> <amount> - Transfer funds\n" +
            "/info - View bot details"
          );
  
        default:
          return bot.sendMessage(chatId, "Unknown command. Use /info to see available commands.");
      }
    } catch (error) {
      console.error("Error handling message:", error);
      return bot.sendMessage(chatId, "An unexpected error occurred while processing your request.");
    }
  });
  

  console.log("Telegram Bot Service Initialized and polling started");

  // **Command Handlers**
  async function handleBalance(chatId: number) {
    try {
      const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
      const signer = new CapsuleEthersSigner(capsule, provider);
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balance);

      return bot.sendMessage(chatId, `Your wallet balance is ${balanceEth} ETH.`);
    } catch (error) {
      console.error("Error fetching balance:", error);
      return bot.sendMessage(chatId, "An error occurred while fetching your balance.");
    }
  }

  async function handleAddress(chatId: number) {
    try {
      const signer = new CapsuleEthersSigner(capsule);
      const address = await signer.getAddress();
      return bot.sendMessage(chatId, `Your wallet address is: ${address}`);
    } catch (error) {
      console.error("Error fetching address:", error);
      return bot.sendMessage(chatId, "An error occurred while fetching your wallet address.");
    }
  }

  async function handleTransactionHistory(chatId: number) {
    try {
      const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
      const signer = new CapsuleEthersSigner(capsule, provider);
      const address = await signer.getAddress();
  
      // Define the maximum number of blocks to search (e.g., last 1,000 blocks)
      const maxBlocks = 1000;
      const latestBlock = await provider.getBlockNumber();
      // Ensure fromBlock doesn't go below 0
      const fromBlock = Math.max(latestBlock - maxBlocks, 0);
  
      // Fetch logs only within the last 1,000 blocks
      const logs: ethers.Log[] = await provider.getLogs({
        address,
        fromBlock: ethers.toQuantity(fromBlock),
        toBlock: ethers.toQuantity(latestBlock),
      });
  
      if (logs.length === 0) {
        return bot.sendMessage(chatId, "No recent transactions found.");
      }
  
      // Optionally sort the logs so that the most recent transactions come first.
      logs.sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0));
  
      // Format and show up to 5 recent transactions
      const formattedHistory = logs.slice(0, 5)
        .map((tx, index) => `#${index + 1}: TxHash ${tx.transactionHash}`)
        .join("\n");
  
      return bot.sendMessage(chatId, `Here are your recent transactions:\n\n${formattedHistory}`);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      return bot.sendMessage(chatId, "An error occurred while fetching your transaction history.");
    }
  }
  

  async function handleTransferCommand(chatId: number, text: string) {
    try {
      const [_, toAddress, amount] = text.split(" ");
  
      // Validate input
      if (!toAddress || !amount) {
        return bot.sendMessage(chatId, "Usage: /transfer <toAddress> <amount>");
      }
  
      if (!ethers.isAddress(toAddress)) {
        return bot.sendMessage(chatId, "Invalid address provided. Please check the recipient address.");
      }
  
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return bot.sendMessage(chatId, "Invalid amount provided. Please enter a positive number.");
      }
  
      const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
      const signer = new CapsuleEthersSigner(capsule, provider);
      const senderAddress = await signer.getAddress();
  
      // Confirm the transfer with the user
      await bot.sendMessage(chatId, `You are about to transfer ${parsedAmount} ETH to ${toAddress} from your wallet (${senderAddress}).`);
  
      // Convert amount to Wei
      const amountInWei = ethers.parseUnits(amount, "ether");
  
      // Get the current gas fee data
      const feeData = await provider.getFeeData();
  
      // Ensure we have non-zero fee values
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || ethers.parseUnits("1.5", "gwei");  // Default to 1.5 gwei if missing
      const maxFeePerGas = feeData.maxFeePerGas || maxPriorityFeePerGas * BigInt(2);  // Double priority fee as fallback
  
      // Get the current chain ID from the provider
      const { chainId } = await provider.getNetwork();
  
      // Create and sign the transaction
      const transaction = {
        from: senderAddress,
        to: toAddress,
        value: amountInWei,
        gasLimit: ethers.toBigInt(21000),
        chainId,
        maxFeePerGas,
        maxPriorityFeePerGas,
      };
  
      const signedTransaction = await signer.signTransaction(transaction);
  
      // Broadcast the transaction
      const txResponse = await provider.broadcastTransaction(signedTransaction);
  
      // Notify user of transaction hash and wait for confirmation
      await bot.sendMessage(chatId, `Transaction initiated successfully. TxHash: ${txResponse.hash}\n\nWaiting for confirmation...`);
  
      // Wait for transaction confirmation
      const receipt = await provider.waitForTransaction(txResponse.hash);
  
      if (receipt && receipt.status === 1) {
        return bot.sendMessage(chatId, `Transaction confirmed! TxHash: ${txResponse.hash}`);
      } else {
        return bot.sendMessage(chatId, "Transaction failed after broadcast. Please check your wallet.");
      }
    } catch (error) {
      console.error("Error initiating transfer:", error);
      return bot.sendMessage(chatId, "An error occurred while processing your transfer. Please try again later.");
    }
  }
  
  
  

  async function handleNaturalLanguageQuery(message: any) {
    const chatId = message.chat.id;
    const userQuery = message.text.toLowerCase();

    if (userQuery.includes("balance")) {
      return await handleBalance(chatId);
    }

    if (userQuery.includes("address")) {
      return await handleAddress(chatId);
    }

    if (userQuery.includes("transaction") || userQuery.includes("history")) {
      return await handleTransactionHistory(chatId);
    }

    if (userQuery.includes("transfer")) {
      return bot.sendMessage(chatId, `To transfer funds, use the command: /transfer <toAddress> <amount>.`);
    }

    return bot.sendMessage(chatId, "I'm not sure how to help with that. Use /info to see available commands.");
  }

  function sendActivationLink(chatId: number, message: string) {
    return bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Activate Bot", web_app: { url: `${process.env.ç}` } }],
        ],
      },
    });
  }

  return { sendMessage: bot.sendMessage.bind(bot), sendImage: bot.sendPhoto.bind(bot) };
};

export default initializeBot();
