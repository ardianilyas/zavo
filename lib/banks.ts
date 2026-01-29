export const INDONESIAN_BANKS = [
  { code: "BCA", name: "Bank Central Asia (BCA)" },
  { code: "MANDIRI", name: "Bank Mandiri" },
  { code: "BNI", name: "Bank Negara Indonesia (BNI)" },
  { code: "BRI", name: "Bank Rakyat Indonesia (BRI)" },
  { code: "BSI", name: "Bank Syariah Indonesia (BSI)" },
  { code: "CIMB", name: "CIMB Niaga" },
  { code: "JAGO", name: "Bank Jago" },
  { code: "JENIUS", name: "Jenius / BTPN" },
  { code: "PERMATA", name: "Bank Permata" },
  { code: "DANAMON", name: "Bank Danamon" },
  { code: "GOPAY", name: "GoPay" },
  { code: "OVO", name: "OVO" },
  { code: "DANA", name: "DANA" },
  { code: "SHOPEEPAY", name: "ShopeePay" },
  { code: "LINKAJA", name: "LinkAja" },
] as const;

export type BankCode = typeof INDONESIAN_BANKS[number]['code'];
