import * as Name from 'w3name'
import { GlobalConfig, W3NameKeyValue } from '../types'
import { updateFlashGlobalConfig } from './flashGlobal'

const createIPNS = async (config: GlobalConfig) => {
  const name = await Name.create()
  const value = ''
  const revision = await Name.v0(name, value)
  await Name.publish(revision, name.key)
  const w3: W3NameKeyValue = {
    key: name.toString(),
    value,
    privKey: name.key.bytes.toString(),
  }
  config.w3namekv = w3
  await updateFlashGlobalConfig(config as GlobalConfig)
}

const updateIPNS = async (config: GlobalConfig) => {
  const nextValue = ''

  const name = await Name.from(Buffer.from(config.w3namekv.privKey))
  const revision = await Name.resolve(name)
  const nextRevision = await Name.increment(revision, nextValue)
  await Name.publish(nextRevision, name.key)
}

const verifyIPNS = async (config: GlobalConfig) => {
  const name = Name.parse(config.w3namekv.key)
  const revision = await Name.resolve(name)
  if (revision.value === config.w3namekv.value) {
    console.log('valid!!')
  } else console.log('not valid')
}

export { createIPNS, updateIPNS, verifyIPNS }
