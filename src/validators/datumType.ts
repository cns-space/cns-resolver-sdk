import { CNSUserRecord } from '../type/cnsUserRecord';

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

    return constructorCorrect && numberOfFieldsCorrect;
};
