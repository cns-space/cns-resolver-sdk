import { BuiltinByteString, ConStr, builtinByteString, conStr0, assocMap, AssocMap, PubKeyAddress, ScriptAddress } from './plutus'

export type CNSUserRecord = ConStr<0, [AssocMap<BuiltinByteString, PubKeyAddress | ScriptAddress>, AssocMap<BuiltinByteString, BuiltinByteString>, AssocMap<BuiltinByteString, BuiltinByteString>]>

export const cnsUserRecord = (virtualDomains: [string, PubKeyAddress | ScriptAddress][], socialProfiles: string[][], otherRecords: string[][]): CNSUserRecord => {
  const virtualDomainsMap = assocMap(virtualDomains.map(([virtualDomain, address]) => [builtinByteString(virtualDomain), address]))
  const socialProfilesMap = assocMap(socialProfiles.map(([socialDomain, socialDomainAddress]) => [builtinByteString(socialDomain), builtinByteString(socialDomainAddress)]))
  const otherRecordsMap = assocMap(otherRecords.map(([recordKey, recordValue]) => [builtinByteString(recordKey), builtinByteString(recordValue)]))
  return conStr0([virtualDomainsMap, socialProfilesMap, otherRecordsMap])
}

export type ParsedCNSUserRecord = {
  virtualDomains: { [key: string]: string }
  socialProfiles: { [key: string]: string }
  otherRecords: { [key: string]: string }
}
