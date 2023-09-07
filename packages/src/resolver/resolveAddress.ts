import { Buffer } from 'buffer';
import dotenv from 'dotenv';
import { validateExpiry } from '../validators';
import { CNSMetadata } from '../type/cnsMetadata';
import { BlockfrostCNS } from '../fetcher';

dotenv.config();

const apiKey = process.env.BLOCKFROST_API_KEY as string;
const policyID = 'fc0e0323b254c0eb7275349d1e32eb6cc7ecfd03f3b71408eb46d751';
const network = "preprod"

export const resolveAddress = async (cnsName: string): Promise<string> => {
  const assetName = Buffer.from(cnsName).toString('hex');
  const assetHex = `${policyID}${assetName}`

  const blockfrost = new BlockfrostCNS(apiKey, network)
  const metadata: CNSMetadata = await blockfrost.getMetadata(assetHex)

  if (!validateExpiry(metadata)) return "CNS expired"

  const data = await blockfrost.getAssetAddress(assetHex)
  if (!data) return "CNS not found"

  const { address } = data[0];
  return address
}

// Example:
// resolveAddress('a9667.ada').then((res) => console.log(res));
