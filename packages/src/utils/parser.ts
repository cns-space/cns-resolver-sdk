import csl from "@emurgo/cardano-serialization-lib-nodejs"
import { AssocMap, BuiltinByteString } from "../type/plutus"

export const parseInlineDatum = <T>(inlineDatum: string): T => {
  const datum = csl.PlutusData.from_hex(inlineDatum).to_json(1)
  const parsed = JSON.parse(datum)
  return parsed
}

export const deserializeHex = (hexString: string): string =>
  Buffer.from(hexString, 'hex').toString('utf8');

export const parseAssocMap = (assocMap: AssocMap<BuiltinByteString, BuiltinByteString>): { [key: string]: string } => {
  const parsedAssocMap: { [key: string]: string } = {}
  assocMap.map.forEach((mapItem) => {
    const key = deserializeHex(mapItem.k.bytes)
    const value = deserializeHex(mapItem.v.bytes)
    parsedAssocMap[key] = value
  })
  return parsedAssocMap
}