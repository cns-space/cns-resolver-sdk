import { Buffer } from 'buffer';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.BLOCKFROST_API_KEY as string;
const policyID = 'fc0e0323b254c0eb7275349d1e32eb6cc7ecfd03f3b71408eb46d751';
const baseApiUrl = 'https://cardano-preprod.blockfrost.io/api/v0';

export const resolveAddress = async (cnsName: string): Promise<string> => {
  const assetName = Buffer.from(cnsName).toString('hex');
  const url = `${baseApiUrl}/assets/${policyID}${assetName}/addresses`
  const data = await axios.get(url, {
    headers: {
      project_id: apiKey,
      'Content-Type': 'application/json'
    }
  }).then((res) => res.data).catch((err) => console.log(err));
  if (!data) {
    return "CNS not found"
  }
  const { address } = data[0];
  console.log(address);
  return address
}

// Example:
// resolveAddress('a9667.ada').then((res) => console.log(res));
