import csl from "@emurgo/cardano-serialization-lib-nodejs"
import { AssocMap, BuiltinByteString } from "../type/plutus"

export const stringToHex = (str: string) => Buffer.from(str, 'utf8').toString('hex');

export const hexToString = (hex: string) => Buffer.from(hex, 'hex').toString('utf8');

export const parseInlineDatum = <T>(inlineDatum: string): T => {
  const datum = csl.PlutusData.from_hex(inlineDatum).to_json(1)
  const parsed = JSON.parse(datum)
  return parsed
}

export const deserializeHex = (hexString: string): string =>
  Buffer.from(hexString, 'hex').toString('utf8');


export const parseAssocMap = <T>(assocMapVal: AssocMap<BuiltinByteString, T>, itemParser: (args0: T) => string, limit = 5): string[][] => {
  const parsedAssocMap: string[][] = []
  for (let i = 0; i < limit; i += 1) {
    if (i >= assocMapVal.map.length) break
    const mapItem = assocMapVal.map[i]
    const key = hexToString(mapItem.k.bytes)
    const value = itemParser(mapItem.v)
    parsedAssocMap.push([key, value])
  }
  return parsedAssocMap
}