import { CNSUserRecord } from "../type/cnsUserRecord";
import { blockfrostGet } from "../fetcher/blockfrost";

export const validateCNSUserRecord = (cnsUserRecord: CNSUserRecord): boolean => {
  const constructorCorrect = cnsUserRecord.constructor === 0;
  const numberOfFieldsCorrect = cnsUserRecord.fields.length === 3;

  /**
   * TODO: Validate the following:
   * 1. virtualDomains is an AssocMap
   * 2. socialProfiles is an AssocMap
   * 3. otherRecords is an AssocMap
   * 4. Value of virtualDomains is an Address
   * 5. All other key value is a BuiltinByteString
   */

  return constructorCorrect && numberOfFieldsCorrect
}

export const validateCNS = async (baseApiUrl: string, policyID: string, assetName: string, apiKey: string) => {
  const metadataUrl = `${baseApiUrl}/assets/${policyID}${assetName}`
  const metadata = await blockfrostGet(metadataUrl, apiKey)
  if (!metadata.onchain_metadata) return [false, false, 5]
  const { expiry, virtualDomainEnabled, virtualDomainLimited } = metadata.onchain_metadata // TODO: change to virtualDomainLimits
  const now = new Date().getTime()
  return [expiry > now, virtualDomainEnabled, virtualDomainLimited]
}