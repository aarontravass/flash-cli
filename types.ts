export type FileEntry = {
  name: string
  size: number
  stream: () => ReadableStream
}

export type DID = `did:key:${string}`

export type Email = `${string}@${string}`

export type Config = {
  storage: string | 'IPFS'
  service: PinningService
  output?: string
  // did?: DID
  // email?: Email
}

export type PinningService =
  | 'nft.storage'
  | 'web3.storage'
  | 'estuary.tech'
  | 'filebase.com'
