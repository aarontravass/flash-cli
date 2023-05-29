import kleur from 'kleur'
import { dirData, fileSize, readTextFile } from '../utils/fs.js'
import { packCAR } from '../utils/ipfs.js'
import type { Config, DID, Email } from '../types.js'
// import { createNewKeypair, getUCANToken, loadKeyPair } from '../utils/ucan.js'
// import { create } from '@web3-storage/w3up-client'
// import prompts from 'prompts'
// import { writeFile } from 'node:fs/promises'

// const uploadToNftStorage = async (car: Blob, ucanToken: string, did: DID) => {
//   const res = await fetch('https://api.nft.storage/upload', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/car',
//       'Authorization': `Bearer ${ucanToken}`,
//       'x-agent-did': did,
//     },
//     body: car,
//   })
//   const text = await res.text()
//   console.log(res.status, text)
// }

// export const uploadToWeb3Storage = async (car: Blob, configEmail?: Email) => {
//   const client = await create()
//   if (!configEmail) {
//     const { email }: { email: Email } = await prompts([
//       {
//         message: 'Enter your email to verify you are not a bot',
//         type: 'text',
//         name: 'email',
//       },
//     ])
//     console.log(`An email to ${email} was sent`)
//     const config = JSON.parse(await readTextFile('flash.json'))
//     await writeFile('flash.json', JSON.stringify({ ...config, email }, null, 2))
//     try {
//       await client.authorize(email)
//     } catch {
//       return console.error(kleur.red(`Failed to send an email to ${email}`))
//     }
//   } else {
//     try {
//       await client.registerSpace(configEmail, {
//         provider: 'did:web:web3.storage',
//       })
//     } catch (e) {
//       const space = await client.createSpace()
//       await client.setCurrentSpace(space.did())
//     }
//   }

//   const result = await client.uploadCAR(car)
//   console.log(result)
// }

// I am in process of implementing UCAN auth for both but it's not working so this is a hotfix
const TEMPORARY_TOKENS = {
  nft: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDczNjc4NWZlNzMyNDUzNjBiNThCMDM5NDUwZDVGNkI5NTNCMzU3N2QiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4NTMwMzI0MzEwMiwibmFtZSI6InVjYW4ifQ.qzJm3smHtJBSbL2JW1bLhvfGhrXeEYAMcKAYL1PX6SY',
  web3: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGRhYzZGYWYyZTU2RENkQTExMGE0ZDlFRDQwMkUyMGMyZEM5RTYwRWIiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODUzNjgxNDcwMTgsIm5hbWUiOiJmbGFzaCJ9.UsYwROi5JoFCqpRWwmCqtbStYhUJdYA9HSwR3w_COZ0'
}

export const uploadCAR = async (car: Blob, endpoint: 'nft' | 'web3') => {
    const res = await fetch(`https://api.${endpoint === 'nft' ? 'nft.storage/upload' : 'web3.storage/car'}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TEMPORARY_TOKENS[endpoint]}`
    },
    body: car,
  })
  const json = await res.json()
  if (!res.ok) {
    console.error(kleur.red(`Error: ${json.message}`))
    process.exit(1)
  }
  return json
}


export const deployToIpfs = async (
  folder: string,
  { service }: Config,
) => {
  const [total, files] = await dirData(folder)
  if (total === 0) return console.error(kleur.red(`Directory is empty`))
  console.log(kleur.green('Deploying on IPFS 🌍'))
  console.log(kleur.white(`Pinning service: ${service} 🛰️`))
  console.log(`Uploading ${fileSize(total)}`)

  const carFile = await packCAR(files, folder)

  let json: any

  if (service === 'web3.storage') json = await uploadCAR(carFile, 'web3')
  else if (service === 'nft.storage') json = await uploadCAR(carFile, 'nft')

  // if (service === 'nft.storage') {
  //   const { kp, did } = _did
  //     ? await loadKeyPair(_did)
  //     : await createNewKeypair()
  //   const token = await getUCANToken(kp)
  //   await uploadToNftStorage(carFile, token, did)
  // } else if (service === 'web3.storage') {
  //   await uploadToWeb3Storage(carFile, email)
  // }

  console.log(`Live on https://${json.cid}.ipfs.dweb.link`)
}
