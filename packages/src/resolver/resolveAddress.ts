import { Buffer } from 'buffer';
import dotenv from 'dotenv';
import { blockfrostGet } from '../utils/blockfrost';
import { validateCNS } from '../utils/validator';

dotenv.config();

const apiKey = process.env.BLOCKFROST_API_KEY as string;
const policyID = 'fc0e0323b254c0eb7275349d1e32eb6cc7ecfd03f3b71408eb46d751';
const baseApiUrl = 'https://cardano-preprod.blockfrost.io/api/v0';

export const resolveAddress = async (cnsName: string): Promise<string> => {
  const assetName = Buffer.from(cnsName).toString('hex');
  const [notExpired] = await validateCNS(baseApiUrl, policyID, assetName, apiKey);
  if (!notExpired) return "CNS expired"

  const url = `${baseApiUrl}/assets/${policyID}${assetName}/addresses`
  const data = await blockfrostGet(url, apiKey)
  if (!data) return "CNS not found"

  const { address } = data[0];
  return address
}

// Example:
// resolveAddress('a9667.ada').then((res) => console.log(res));
