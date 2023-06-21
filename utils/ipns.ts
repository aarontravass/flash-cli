import * as Name from 'w3name'
import { GlobalConfig, W3NameKeyValue } from '../types'
import { updateFlashGlobalConfig } from './flashGlobal'

const createIPNS = async (ipnsValue: string | undefined) => {
  if (!ipnsValue) throw new Error('IPNS value is required')
  const config = {
    W3NameKV: {},
    email: undefined,
    did: undefined
  }
  const name = await Name.create()
  const revision = await Name.v0(name, ipnsValue)
  await Name.publish(revision, name.key)
  const w3: W3NameKeyValue = {
    privKey: Buffer.from(name._privKey.bytes).toString('hex'),
    value: ipnsValue
  }
  config.W3NameKV = w3
  await updateFlashGlobalConfig(config as GlobalConfig)
}

const verifyIPNS = async (config: GlobalConfig) => {
  const privKey = config?.W3NameKV?.privKey

  const name = await Name.from(Uint8Array.from(Buffer.from(privKey!, 'hex')))
  const revision = await Name.resolve(name)
  if (revision.value === config?.W3NameKV?.value) {
    console.log('Key/Value is vali!d')
  } else console.error('Key/Value is not valid')
}

export { createIPNS, verifyIPNS }
