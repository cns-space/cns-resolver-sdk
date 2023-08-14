import { CNSUserRecord } from "../type/cnsUserRecord";
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