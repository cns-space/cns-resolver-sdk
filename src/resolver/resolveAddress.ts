import { Buffer } from 'buffer';
import dotenv from 'dotenv';
import { validateExpiry } from '../validators';
import { CNSMetadata } from '../type/cnsMetadata';
import { MaestroCNS } from '../fetcher';

dotenv.config();

const apiKey = process.env.MAESTRO_API_KEY as string;
const policyID = 'fc0e0323b254c0eb7275349d1e32eb6cc7ecfd03f3b71408eb46d751';
const network = "preprod"

export const resolveAddress = async (cnsName: string): Promise<string> => {
  const assetName = Buffer.from(cnsName).toString('hex');
  const assetHex = `${policyID}${assetName}`

  const maestro = new MaestroCNS(apiKey, network)
  const metadata: CNSMetadata = await maestro.getMetadata(policyID, assetName)

  if (!validateExpiry(metadata)) return "CNS expired"

  const data = await maestro.getAssetAddress(assetHex)
  if (!data) return "CNS not found"

  const { address } = data[0];
  return address
}

// Example:
// resolveAddress('bbb.ada').then((res) => console.log(res));
