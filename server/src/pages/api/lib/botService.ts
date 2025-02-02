/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
 
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { Redis } from "@upstash/redis";
const TelegramBot = require('node-telegram-bot-api');
import { ethers } from "ethers";
import { CapsuleEthersSigner } from "@usecapsule/ethers-v6-integration";
import capsuleClient from "./capsuleClient";

const CAPSULE_ENV: Environment = process.env.VITE_CAPSULE_ENV as Environment;
const capsule = new CapsuleServer(CAPSULE_ENV, process.env.VITE_CAPSULE_API_KEY);
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

let bot: typeof TelegramBot | null = null;

const initializeBot = () => {
  if (bot) {
    console.log('Bot is already initialized');
    return bot;
  }

  console.log('Initializing Telegram Bot Service');
  console.log('Environment:', process.env.NEXT_PUBLIC_ENV);

  const TELEGRAM_TOKEN = process.env.NEXT_PUBLIC_ENV === 'development'
    ? process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN_DEV
    : process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;

  if (!TELEGRAM_TOKEN) {
    throw new Error('TELEGRAM_TOKEN is not defined');
  }

  bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

  bot.on('polling_error', (error: any) => {
    console.error('Polling error:',);
  });

  bot.on("message", async (message: any) => {
    const chatId = message.chat.id;
    const telegramId = message.from.id;

    if (!message.text?.startsWith("/")) {
      return bot.sendMessage(chatId, "Please use /balance or /transfer commands.");
    }

    try {
      // Check user session in Redis
      const userSession: any = await redis.get(`capsule:user:${telegramId}`);
      if (!userSession) {
        return bot.sendMessage(
          chatId,
          "Your session is inactive. Please activate the bot via the link below:",
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "Activate Bot", web_app: {url: `${process.env.NEXT_PUBLIC_CLIENT_URL}`} }],
              ],
            },
          }
        );
      }

      
      const sessionImport = await capsule.importSession(userSession);
      const success = await capsule.keepSessionAlive();
      if (!success) {
        // Handle failed session maintenance
        await capsule.refreshSession(true);
      }
      const isSessionActive = await capsule.isSessionActive();
      console.log('isSessionActive: ', isSessionActive);
      if (!isSessionActive) {
        return bot.sendMessage(
          chatId,
          "Your session has expired. Please reactivate the bot using the link below:",
          {
            reply_markup: {
              
              inline_keyboard: [
                [{ text: "Reactivate Bot", web_app: {url: `${process.env.NEXT_PUBLIC_CLIENT_URL}`} }],
              ],
            },
          }
        );
      }

      // Handle commands
      const command = message.text.split(" ")[0];
      switch (command) {
        case "/balance": {
          const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
          const signer = new CapsuleEthersSigner(capsuleClient, provider);
          const address = await signer.getAddress();
          const balance = await provider.getBalance(address);
          const balanceEth = ethers.formatEther(balance);
          return bot.sendMessage(chatId, `Your wallet balance is ${balanceEth} ETH.`);
        }

        case "/transfer": {
          const [_, toAddress, amount] = message.text.split(" ");
          if (!toAddress || !amount) {
            return bot.sendMessage(chatId, "Usage: /transfer <toAddress> <amount>");
          }

          const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
          const signer = new CapsuleEthersSigner(capsuleClient, provider);

          const address = await signer.getAddress();
          const tx = {
            from: address,
            to: toAddress,
            value: ethers.parseUnits(amount, "ether"),
          };

          const signedTx = await signer.signTransaction(tx);
          // Typically, you'd broadcast the transaction here (e.g., via `provider.sendTransaction`)
          return bot.sendMessage(chatId, `Transaction signed successfully: ${signedTx}`);
        }

        default:
          return bot.sendMessage(chatId, "Unknown command. Use /balance or /transfer.");
      }
    } catch (error) {
      console.error("Error handling message:", error);
      return bot.sendMessage(chatId, "An error occurred while processing your request.");
    }
  });


  console.log("Telegram Bot Service Initialized and polling started");

  // Define the functions to be exported

  const sendMessage = async (
    chatId: number,
    message: string,
    options?: any
  ) => {
    console.log('Sending message:', message);
    await bot!.sendMessage(chatId, message, options);
  };

  const sendImage = async (chatId: number, photo: File, options?: any) => {
    await bot!.sendPhoto(chatId, photo, options);
  };

  return { sendMessage, sendImage };
};

// Initialize the bot and export the functions
const botInstance = initializeBot();
export const { sendMessage, getCommonGroups, sendImage } = botInstance;
export default initializeBot;