import kleur from 'kleur'
import { NFTStorage } from 'nft.storage'
import { stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { fileSize, walk } from '../utils.js'
import { Readable } from 'node:stream'
import { ReadableStream } from 'node:stream/web'

const dirData = async (
  dir: string,
) => {
  let total = 0
  const files: {name: string, size: number; stream: () => ReadableStream }[] = []
  for await (
    const path of walk(dir)
  ) {
    const size = (await stat(path)).size
    total += size
    files.push({
      name: dir === '.' ? path : path.replace(dir, ''),
      size,
      stream: () => Readable.toWeb(createReadStream(path)),
    })
  }
  return [total, files] as const
}

const w3s = new NFTStorage({
  token: /* i'll delete it later */
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDczNjc4NWZlNzMyNDUzNjBiNThCMDM5NDUwZDVGNkI5NTNCMzU3N2QiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4NDk0NDYzMjQyNCwibmFtZSI6InRlc3QifQ.cdk_ajPj1y4DHchEGbyO4EJd74604OEKUyIO9hxLKc0',
})

export const deployToIpfs = async (folder: string, service: string) => {
  const [total, files] = await dirData(folder)
  if (total === 0) return console.error(kleur.red(`Directory is empty`))
  console.log(kleur.green('Deploying on IPFS 🌍'))
  console.log(kleur.white(`Pinning service: ${service} 🛰️`))
  console.log(`Uploading ${fileSize(total)}`)
  

  if (service === 'nft.storage') {
    const result = await w3s.storeDirectory(files)
    console.log(`Live on https://${result}.ipfs.dweb.link`)
  }
}