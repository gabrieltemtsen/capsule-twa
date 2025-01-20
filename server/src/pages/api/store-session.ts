// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
if (req.method === 'POST') {
    const data = req.body;
    console.log(data);
    res.status(200).json(data);
} else {
    res.status(405).json({ message: 'Method Not Allowed' });
}
}
