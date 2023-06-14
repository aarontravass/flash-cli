import kleur from 'kleur'
import { dirData, fileSize } from '../utils/fs.js'
import {
  packCAR,
  uploadCARWithUCAN,
  uploadCARWithApiToken,
} from '../utils/ipfs.js'
import type { Config } from '../types.js'

export const deployToIpfs = async (
  folder: string,
  { provider }: Config,
  ci = false
) => {
  const [total, files] = await dirData(folder)
  if (total === 0) return console.error(kleur.red(`Directory is empty`))
  console.log(kleur.green('Deploying on IPFS 🌍'))
  console.log(kleur.white(`Storage provider: ${provider} 🛰️`))
  console.log(`Uploading ${fileSize(total)}`)

  const carFile = await packCAR(files, folder)

  const response = ci
    ? await uploadCARWithApiToken(carFile, provider)
    : await uploadCARWithUCAN(carFile, provider)

  console.log(`Live on https://${response}.ipfs.dweb.link`)
}
