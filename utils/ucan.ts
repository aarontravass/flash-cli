import { KeyPair } from 'ucan-storage/keypair'
import { build, validate } from 'ucan-storage/ucan-storage'
import { writeFile } from 'node:fs/promises'
import * as envFile from 'envfile'
import { readTextFile } from './fs.js'
import { DID } from '../types.js'

const UCAN_ROOTS = {
  web3:
    'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCIsInVjdiI6IjAuOC4wIn0.eyJhdWQiOiJkaWQ6a2V5Ono2TWtuY3JjdXN1RWdMdjFjRnRMRGlMUnhkOHdMOU5mSEJCVmJ0cGJLUkhvc1R5cyIsImF0dCI6W3sid2l0aCI6InN0b3JhZ2U6Ly9kaWQ6a2V5Ono2TWtuY3JjdXN1RWdMdjFjRnRMRGlMUnhkOHdMOU5mSEJCVmJ0cGJLUkhvc1R5cyIsImNhbiI6InVwbG9hZC8qIn1dLCJleHAiOjE3MzQzODY0MDAsImlzcyI6ImRpZDprZXk6ejZNa21LbWVZdVVKUW9yVlFIMkpDS1pmTVpnNlpNNW13ODh1amFBNEJWNnY4aXJjIiwicHJmIjpbbnVsbF19.Bg-htXNiPSzIIrBSxO0YxDPfcqW-9-sibrJnPN_FEzeBMNg3zkDPzGtradlNLOPB7oR9Ve0wvEX-IAzW9zEsAw',
}

const tryReadEnv = async () => {
  try {
    return await readTextFile('.env')
  } catch {
    return ''
  }
}

export const createNewKeypair = async () => {
  const kp = await KeyPair.create()
  const did = kp.did() as DID
  const config = JSON.parse(await readTextFile('flash.json'))
  await writeFile(
    'flash.json',
    JSON.stringify({ ...config, did }, null, 2),
  )

  const env = envFile.parse(await tryReadEnv())
  await writeFile(
    '.env',
    envFile.stringify({ ...env, UCAN_PK: `${kp.export()}` }),
  )

  return { kp, did }
}

export const loadKeyPair = async (did: DID) => {
  const env = envFile.parse(await tryReadEnv())
  const kp = await KeyPair.fromExportedKey(env.UCAN_PK)
  return { kp, did: did || kp.did() }
}

const expireOneYear = () => {
  const now = new Date()

  now.setFullYear(now.getFullYear() + 1)

  return Date.parse(now.toString())
}

export const getUCANToken = async (kp: KeyPair) => {
  const audienceDID = `storage://did:key:${kp.publicKeyStr()}`
  const { payload } = await validate(UCAN_ROOTS.web3)
  const { att } = payload
  const proofs = [UCAN_ROOTS.web3]
  const token = await build({
    issuer: kp,
    audience: audienceDID,
    // @ts-ignore bruh
    capabilities: att,
    proofs,
    expiration: expireOneYear(),
  })
  return token
}
