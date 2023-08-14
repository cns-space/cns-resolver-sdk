import { BuiltinByteString, ConStr0, builtinByteString, conStr0, assocMap, AssocMap } from './plutus'

export type CNSUserRecord = ConStr0<[AssocMap<BuiltinByteString, BuiltinByteString>, AssocMap<BuiltinByteString, BuiltinByteString>]>

export const cnsUserRecord = (virtualDomains: [string, string][], mobile: string, email: string, twitter: string, discord: string, telegram: string) => {
  const virtualDomainsMap = assocMap(virtualDomains.map(([virtualDomain, virtualDomainAddress]) => [builtinByteString(virtualDomain), builtinByteString(virtualDomainAddress)]))
  const socialRecords = [["mobile", mobile], ["email", email], ["twitter", twitter], ["discord", discord], ["telegram", telegram]]
  const socialRecordsMap = assocMap(socialRecords.map(([socialDomain, socialDomainAddress]) => [builtinByteString(socialDomain), builtinByteString(socialDomainAddress)]))
  return conStr0([virtualDomainsMap, socialRecordsMap])
}

export type ParsedCNSUserRecord = {
  virtualDomains: { [key: string]: string },
  socialProfiles: { [key: string]: string }
}

// const myRecord = cnsRecord([['key1', 'value1'], ['key2', 'value2']], 'mobile', 'email', 'twitter', 'discord', 'telegram')
// console.log(JSON.stringify(myRecord));
