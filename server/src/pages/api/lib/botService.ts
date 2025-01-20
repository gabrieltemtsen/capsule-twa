/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */

const TelegramBot = require('node-telegram-bot-api');

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
    console.error('Polling error:', error);
  });

  bot.on('message', async (message: any) => {
    console.log('Received message:', message);
    const chatId = message.chat.id;
    const userName = message.chat.username || message.chat.first_name || 'Anonymous';
    const timestamp = Date.now();

    if (message.chat.type !== 'private') {
      return;
    }
    let messageType: any = 'text'; // Default type
    let content = message.text || '';

    if (message.photo) {
      messageType = 'image';

      // Store the file_id of the highest resolution image available
      const largestImage = message.photo.sort((a: any, b: any) => b.file_size - a.file_size)[0];
      const fileInfo = await bot.getFile(largestImage.file_id);
      const filePath = fileInfo.file_path;

      content = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;
      console.log(8121, content);

    } else if (message.voice) {
      messageType = 'audio';
      const fileInfo = await bot.getFile(message.voice.file_id);
      const filePath = fileInfo.file_path;

      content = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;

    }
    //sending message to user - Auto reply
    const response = `You said: ${message.text || 'you sent an image or audio'}`;
    console.log('Sending response:', response);

    bot.sendMessage(chatId, response).catch((error: any) => {
      console.error('Error sending message:', error);
    });
  });

  console.log('Telegram Bot Service Initialized and polling started');

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