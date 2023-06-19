export type FileEntry = {
  name: string
  size: number
  stream: () => ReadableStream
}

export type DID = `did:${string}:${string}`

export type Email = `${string}@${string}`

export type W3NameKeyValue = { privKey: string, value: string }

export type Config = {
  protocol: 'ipfs'
  provider: StorageProvider
  output?: string
}

export type GlobalConfig = {
  email: Email
  did: DID
  w3namekv?: W3NameKeyValue
}

export type StorageProvider =
  | 'nft.storage'
  | 'web3.storage'
  | 'estuary.tech'
  | 'filebase.com'
