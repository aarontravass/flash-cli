import * as Name from 'w3name'
import { GlobalConfig, W3NameKeyValue } from '../types'
import { updateFlashGlobalConfig } from './flashGlobal'

const createIPNS = async (config: GlobalConfig) => {
  if (!config) {
    config = {
      w3namekv: undefined,
      email: undefined,
      did: undefined,
    }
  }
  const name = await Name.create()
  const value = ''
  const revision = await Name.v0(name, value)
  await Name.publish(revision, name.key)
  const w3: W3NameKeyValue = {
    privKey: Buffer.from(name._privKey.bytes).toString('hex'),
    value,
  }
  config.w3namekv = w3
  console.log(w3)
  await updateFlashGlobalConfig(config as GlobalConfig)
}

const verifyIPNS = async (config: GlobalConfig) => {
  let privKey
  if (process.env.FLASH_W3NAME_PK) privKey = process.env.FLASH_W3NAME_PK
  else privKey = config.w3namekv?.privKey
  if (!config.w3namekv) {
    console.log('Could not find private key')
    process.exit(1)
  }
  const name = await Name.from(Uint8Array.from(Buffer.from(privKey, 'hex')))
  const revision = await Name.resolve(name)
  if (revision.value === config.w3namekv.value) {
    console.log('key is valid')
  } else console.log('key is not valid')
}

export { createIPNS, verifyIPNS }
