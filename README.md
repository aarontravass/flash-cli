![](https://bafkreibgn7zwhzt3tazfrbsevboe3pxpvlbvd6yq6fbkq6dmd6tlmxysni.ipfs.nftstorage.link/)

# Flash CLI

This repository contains a very basic prototype demonstrating features of
Flash - deployment on decentralized storage and blockchain-based computing
services.

See the [landing page](https://flash-dev.vercel.app) for more info.

## Install

```sh
npm i -g @flash-dev/cli
```

## Build from source

```sh
pnpm install && pnpm compile
pnpm link --global
flash
```

## Ecosystem

Supported frameworks:

- Next.js
- Nuxt.js
- Lume (Deno)
- CRA
- static
- anything else Vercel and Fleek supports (WIP)

Supported providers:

- IPFS
  - nft.storage
  - web3.storage
  - Estuary
  - Filebase (WIP)
- Arweave
  - Bundlr (WIP) 

Supported protocols:

- IPFS
- Arweave (WIP)

Supported Serverless/Web3:

- Gelato
- Taubyte (Maybe/WIP)
- IPVM (not implemented yet)
