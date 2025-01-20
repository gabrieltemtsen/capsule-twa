/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next/types';
import initializeBot from './lib/botService';

let bot : any = null;

const startBot = (req: NextApiRequest, res: NextApiResponse) => {
  if (!bot) {
    bot = initializeBot();
  }
  res.status(200).json({ message: 'Bot is running' });
};

export default startBot;