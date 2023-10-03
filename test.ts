import csl from "@emurgo/cardano-serialization-lib-nodejs"

const adadomainData = "d8799fa3487669727475616c315f5840616464725f74657374317172676b72346a77617538776b6b30657a66383479727576337561687a6c6b7367787664326e79747a6c6e71667434783873326e6c76582c6c323366383266757439326138326a79746e77346b377030657379676b3270363236766a647175353875396eff487669727475616c325f5840616464725f74657374317172676b72346a77617538776b6b30657a66383479727576337561687a6c6b7367787664326e79747a6c6e71667434783873326e6c76582c6c323366383266757439326138326a79746e77346b377030657379676b3270363236766a647175353875396eff487669727475616c335f5840616464725f74657374317172676b72346a77617538776b6b30657a66383479727576337561687a6c6b7367787664326e79747a6c6e71667434783873326e6c76582c6c323366383266757439326138326a79746e77346b377030657379676b3270363236766a647175353875396effa5466d6f62696c654c2b383532313233343536373845656d61696c4d636e7340636e732e7370616365477477697474657249736964616e6c69666547646973636f72644d736964616e77686174657665724874656c656772616d4d736964616e7768617465766572ff"
const datum = csl.PlutusData.from_hex(adadomainData).to_json(1)
const parsed = JSON.parse(datum)
console.log(JSON.stringify(parsed));