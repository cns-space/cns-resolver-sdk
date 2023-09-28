import dotenv from 'dotenv';
import { validateExpiry, validateVirtualSubdomainEnabled } from '../validators';
import { CNSMetadata } from '../type/cnsMetadata';
import { MaestroCNS } from '../fetcher';
import { validateCNSUserRecord } from '../validators/datumType';
import { CNSUserRecord, ParsedCNSUserRecord } from "../type/cnsUserRecord";
import { hexToString, objToHex, parseAssocMap, parsePlutusAddressToBech32 } from '../utils/parser';

dotenv.config();

// TODO: Changing the constants to match preprod / mainnet env
const apiKey = process.env.MAESTRO_API_KEY as string;
const cnsPolicyID = 'fc0e0323b254c0eb7275349d1e32eb6cc7ecfd03f3b71408eb46d751';
const recordPolicyID = '3cb87ba516477b0790ce10e8c5c35e6ce5f4ef0c9d10afb945bbdc91';
const networkId = 0
const network = "preprod"

export const resolveUserRecord = async (cnsName: string): Promise<ParsedCNSUserRecord | string> => {
  const assetName = Buffer.from(cnsName).toString('hex');

  const maestro = new MaestroCNS(apiKey, network)
  const metadata: CNSMetadata = await maestro.getMetadata(cnsPolicyID, assetName)

  if (!validateExpiry(metadata)) return "CNS expired"

  const recordAssetHex = `${recordPolicyID}${assetName}`
  const inlineDatum: CNSUserRecord = await maestro.getAssetInlineDatum(recordAssetHex)

  if (!validateCNSUserRecord(inlineDatum)) return "Invalid user record"
  if (!validateVirtualSubdomainEnabled(metadata)) console.log("Virtual subdomain is not enabled");

  const parsedInlineDatum: ParsedCNSUserRecord = {
    virtualSubdomains: validateVirtualSubdomainEnabled(metadata) ? parseAssocMap(inlineDatum.fields[0], (item) => parsePlutusAddressToBech32(objToHex(item), networkId || 0)) : [],
    // virtualSubdomains: parseAssocMap(inlineDatum.fields[0], (item) => parsePlutusAddressToBech32(objToHex(item), networkId || 0)),
    socialProfiles: parseAssocMap(inlineDatum.fields[1], (item) => hexToString(item.bytes)),
    otherRecords: parseAssocMap(inlineDatum.fields[2], (item) => hexToString(item.bytes)),
  }

  return parsedInlineDatum
}
// Example:
// resolveUserRecord('bbb.ada').then((res) => console.log(res));

export const resolveVirtualSubdomains = async (cnsName: string): Promise<string[][] | string> => {
  const parsedUserRecord = await resolveUserRecord(cnsName)
  if (typeof parsedUserRecord === 'string') return parsedUserRecord
  return parsedUserRecord.virtualSubdomains
}
// Example:
// resolveVirtualSubdomains('bbb.ada').then((res) => console.log(res));

export const resolveVirtualSubdomain = async (virtualDomain: string): Promise<string> => {
  const [target, cnsName, ext] = virtualDomain.split('.')
  if (!target || !cnsName || !ext) return "Invalid virtual domain"

  const virtualDomains = await resolveVirtualSubdomains(`${cnsName}.${ext}`)
  if (typeof virtualDomains === 'string') return virtualDomains

  const resolvedVirtualDomain = virtualDomains?.find(([key]) => key === target)
  if (!resolvedVirtualDomain) return "Virtual domain not found"

  return resolvedVirtualDomain[1]
}
// Example
// resolveVirtualSubdomain('456.bbb.ada').then((res) => console.log(res));

export const resolveSocialRecords = async (cnsName: string): Promise<string[][] | string> => {
  const parsedUserRecord = await resolveUserRecord(cnsName)
  if (typeof parsedUserRecord === 'string') return parsedUserRecord
  return parsedUserRecord.socialProfiles
}
// // Example
// resolveSocialRecords('bbb.ada').then((res) => console.log(res));

export const resolveOtherRecords = async (cnsName: string): Promise<string[][] | string> => {
  const parsedUserRecord = await resolveUserRecord(cnsName)
  if (typeof parsedUserRecord === 'string') return parsedUserRecord
  return parsedUserRecord.otherRecords
}
// // Example
// resolveOtherRecords('bbb.ada').then((res) => console.log(res));
