import { CNSUserRecord } from "../type/cnsUserRecord";
import { blockfrostGet } from "./blockfrost";
import { parseAssocMap } from "./parser";

const socialProfiles = ["mobile", "email", "twitter", "discord", "telegram"]

export const validateCNSUserRecord = (cnsUserRecord: CNSUserRecord): boolean => {
  const constructorCorrect = cnsUserRecord.constructor === 0;
  const numberOfFieldsCorrect = cnsUserRecord.fields.length === 2;
  const virtualDomainsCorrect = cnsUserRecord.fields[0].map.every((item) => item.k.bytes && item.v.bytes);
  const parsedSocialRecords = parseAssocMap(cnsUserRecord.fields[1]);
  const socialRecordsCorrect = socialProfiles.every((profile) => profile in parsedSocialRecords);
  return constructorCorrect && numberOfFieldsCorrect && virtualDomainsCorrect && socialRecordsCorrect;
}

export const validateCNS = async (baseApiUrl: string, policyID: string, assetName: string, apiKey: string) => {
  const metadataUrl = `${baseApiUrl}/assets/${policyID}${assetName}`
  const metadata = await blockfrostGet(metadataUrl, apiKey)
  if (!metadata.onchain_metadata) return [false, false, 5]
  const { expiry, virtualDomainEnabled, virtualDomainLimited } = metadata.onchain_metadata // TODO: change to virtualDomainLimits
  const now = new Date().getTime()
  return [expiry > now, virtualDomainEnabled, virtualDomainLimited]
}