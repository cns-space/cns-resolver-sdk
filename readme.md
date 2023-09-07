# CNS Resolver SDK

This is the for resolving official CNS information. This documentation would outline the technical details and APIs provided. For any projects interested in integrating CNS information, here provides sufficient information on either implementing the resolving logics separately or directly using the SDK.

## Information CNS provided

1. Domain Address

   - The current address owning the CNS token.
   - Example of a domain name: `cns.ada`

2. Virtual Sub-domain Address

   - The pointer configured by CNS owner to other customized Cardano addresses.
   - Information represents by a key-value on chain through inline datum.
   - Example of a virtual sub-domain name: `sub1.cns.ada` (key: `sub1`, value: the Cardano address)

3. Social Handles

   - The social medias handle configured by the CNS owner.
   - Information represents by a key-value on chain through inline datum.
   - key: social media type (e.g. telegram, twitter, discord etc)
   - value: the handle as configured.

4. Customized Records
   - Any other key value information the user wishes to set.
   - Information represents by a key-value on chain through inline datum.

## Resolving Methodology

| Item                       | Validation       | Resolving Methods                                                                                      | SDK API                                                                                                          |
| -------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Domain Address             | Expiry           | 1. Get the current address the CNS residing on                                                         | Draft of [`resolveAddress`](./packages/src/resolver/resolveAddress.ts)                                           |
| Virtual Sub-domain Address | Expiry & Enabled | 1. Get the inline datum of the user record <br> 2. Resolve the one with correct virtual sub-domain key | Draft of [`resolveVirtualSubdomain` & `resolveVirtualSubdomains`](./packages/src/resolver/resolveUserRecords.ts) |
| Social Handles             | Expiry           | 1. Get the inline datum of the user record <br> 2. Resolve the one with correct social key             | Draft of [`resolveSocialProfiles`](./packages/src/resolver/resolveUserRecords.ts)                                |
| Customized Records         | Expiry           | 1. Get the inline datum of the user record <br> 2. Resolve the one with correct key                    | Draft of [`resolveOtherRecords`](./packages/src/resolver/resolveUserRecords.ts)                                  |

## Validation Approach

1. Expiry - Expiry Validation

   - Read the metadata attached with the CNS, and get the `expiry` field
   - Compare the `current millisecond` with `expiry` record
   - Valid if `current millisecond < expiry`
   - [`Example implementation`](./packages/src/validators/expiry.ts)

2. Enabled - Virtual Sub-domain Enabled

   - Read the metadata attached with the CNS, and get the virtual Subdomain.
   - Valid if `Enabled`
   - [`Example implementation`](./packages/src/validators/virtualSubdomainEnabled.ts)

## Schemas

### CNS Metadata

```ts
interface CNSMetadata {
  name: string;
  image: string;
  expiry: number; // Timestamp Millisecond
  origin: string;
  cnsType: string;
  mediaType: string;
  description: string;
  virtualSubdomainLimits: number;
  virtualSubdomainEnabled: "Enabled" | "Disabled";
}
```

### User Record Inline Datum ([JSON example](./packages/src/example/mockData.json))

```hs
import PlutusTx.AssocMap (Map(..))

data CNSUserRecordDatum = CNSUserRecordDatum
  (Map BuiltinByteString Address)           -- First map represents virtual sub-domain mapping
  (Map BuiltinByteString BuiltinByteString) -- Second map represents social profile mapping
  (Map BuiltinByteString BuiltinByteString) -- Third map represents custom records

```
