// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};
console.log("helloSTORING SESSION");

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  console.log( 'level 1')
  const data = req.body;
  console.log(data);  console.log( 'level 2')
  console.log(data);
  res.status(200).json(data);
}
