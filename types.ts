export type FileEntry = {
  name: string
  size: number
  stream: () => ReadableStream
}

export type DID = `did:key:${string}`

export type Email = `${string}@${string}`

export type Config = {
  protocol: 'ipfs'
  provider: StorageProvider
  output?: string
}

export type GlobalConfig = {
  email: Email
  did: DID,
  w3nameKey: string
}

export type StorageProvider =
  | 'nft.storage'
  | 'web3.storage'
  | 'estuary.tech'
  | 'filebase.com'
