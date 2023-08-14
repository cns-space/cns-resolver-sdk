import { Buffer } from 'buffer';
import axios from 'axios';
import dotenv from 'dotenv';
import { validateCNSUserRecord } from '../utils/validator';
import { CNSUserRecord, ParsedCNSUserRecord } from "../type/cnsUserRecord";
import { parseAssocMap, parseInlineDatum } from '../utils/parser';

dotenv.config();

// TODO: Changing the constants to match preprod / mainnet env
const apiKey = process.env.BLOCKFROST_API_KEY as string;
const policyID = '537dd5bccea9c11993eed55fd496451e0fd5fb718ef346449c170763';
const cnsUserRecordValidator = 'addr_test1qzjwez8xm62m8uz7dsptllf37f5czkqnp56c0ke6456kgvgx6625c3k4ald5qzspkxcnrq7jq0mffn0rxkdagalj2yyqg0tta7'
const baseApiUrl = 'https://cardano-preprod.blockfrost.io/api/v0';

export const resolveUserRecord = async (cnsName: string): Promise<ParsedCNSUserRecord | string> => {
  const assetName = Buffer.from(cnsName).toString('hex');
  const txUrl = `${baseApiUrl}/assets/${policyID}${assetName}/transactions?order=desc&count=1`
  const txData = await axios.get(txUrl, {
    headers: {
      project_id: apiKey,
      'Content-Type': 'application/json'
    }
  }).then((res) => res.data).catch((err) => console.log(err));
  if (!txData) return "CNS not found"

  const { tx_hash } = txData[0];
  const url = `${baseApiUrl}/txs/${tx_hash}/utxos`
  const utxoData = await axios.get(url, {
    headers: {
      project_id: apiKey,
      'Content-Type': 'application/json'
    }
  }).then((res) => res.data).catch((err) => console.log(err));
  if (!utxoData) return "CNS not found"

  const rawInlineDatum: string = utxoData.outputs.find((o) => o.address === cnsUserRecordValidator)?.inline_datum
  const inlineDatum: CNSUserRecord = parseInlineDatum(rawInlineDatum)

  if (!validateCNSUserRecord(inlineDatum)) return "Invalid user record"
  const parsedInlineDatum = { virtualDomains: parseAssocMap(inlineDatum.fields[0]), socialProfiles: parseAssocMap(inlineDatum.fields[1]) }

  return parsedInlineDatum
}
// Example:
// resolveUserRecord('jerome.ada').then((res) => console.log(res));

export const resolveVirtualDomains = async (cnsName: string): Promise<{ [key: string]: string } | string> => {
  const parsedUserRecord = await resolveUserRecord(cnsName)
  if (typeof parsedUserRecord === 'string') return parsedUserRecord
  return parsedUserRecord.virtualDomains
}
// Example:
// resolveVirtualDomains('jerome.ada').then((res) => console.log(res));

export const resolveVirtualDomain = async (virtualDomain: string): Promise<string> => {
  const [target, cnsName, ext] = virtualDomain.split('.')
  if (!target || !cnsName || !ext) return "Invalid virtual domain"

  const virtualDomains = await resolveVirtualDomains(`${cnsName}.${ext}`)
  if (typeof virtualDomains === 'string') return virtualDomains

  const resolvedVirtualDomain = virtualDomains?.[target]
  if (!resolvedVirtualDomain) return "Virtual domain not found"

  return resolvedVirtualDomain
}
// Example
// resolveVirtualDomain('virtual3.jerome.ada').then((res) => console.log(res));

export const resolveSocialRecords = async (cnsName: string): Promise<{ [key: string]: string } | string> => {
  const parsedUserRecord = await resolveUserRecord(cnsName)
  if (typeof parsedUserRecord === 'string') return parsedUserRecord
  return parsedUserRecord.socialProfiles
}
// Example
// resolveSocialRecords('jerome.ada').then((res) => console.log(res));
