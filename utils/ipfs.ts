import { CAREncoderStream, createDirectoryEncoderStream } from 'ipfs-car'
import type { FileEntry } from '../types'
import { CID } from 'multiformats/cid'
import { tmpdir } from 'node:os'
import { readFile, open } from 'node:fs/promises'
import { Writable } from 'node:stream'
import { createWriteStream } from 'node:fs'
import { CarWriter } from '@ipld/car/writer'
import { create } from '@web3-storage/w3up-client'
import kleur from 'kleur'
import type { Config } from '../types'
import { getGlobalFlashConfig, updateFlashGlobalConfig } from './flashglobal'
import prompts from 'prompts'
const tmp = tmpdir()

export const packCAR = async (files: FileEntry[], folder: string) => {
  const output = `${tmp}/${folder}.car`
  const placeholderCID = CID.parse(
    'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'
  )
  let rootCID: CID<unknown, number, number, 1>
  await createDirectoryEncoderStream(files)
    .pipeThrough(
      new TransformStream({
        transform(block, controller) {
          rootCID = block.cid as CID<unknown, number, number, 1>
          controller.enqueue(block)
        },
      })
    )
    .pipeThrough(new CAREncoderStream([placeholderCID]))
    .pipeTo(Writable.toWeb(createWriteStream(output)))

  const fd = await open(output, 'r+')
  await CarWriter.updateRootsInFile(fd, [rootCID!])
  await fd.close()

  const file = await readFile(output)
  const blob = new Blob([file], { type: 'application/vnd.ipld.car' })
  return blob
}

const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

const emailPrompt = async () =>
  await prompts(
    [
      {
        name: 'email',
        type: 'text',
        message: "Verify your email to confirm that you're not a bot",
        validate: value => (!emailPattern.test(value) ? 'Invalid email' : true),
      },
    ]
  )

export const uploadCAR = async (car: Blob, { service }: Config) => {
  const client = await create()
  let globalConfig = await getGlobalFlashConfig()
  if (!globalConfig) {
    const result = await emailPrompt()
    if (!result.email) return process.exit(0)
    console.log(`Sent email to ${result.email} 📧`)
    await client.authorize(result.email)

    console.log(kleur.cyan('Email authorized, uploading...'))

    const space = await client.createSpace()

    const did = space.did()

    await client.setCurrentSpace(did)
    try {
      await client.registerSpace(result.email, {
        provider: `did:web:${service}`,
      })
    } catch (err) {
      console.error('registration failed: ', err)
    }

    globalConfig = {
      email: result.email,
      did: did,
    }
    await updateFlashGlobalConfig(globalConfig)
  } else {
    await client.setCurrentSpace(globalConfig.did)
  }

  const result = await client.uploadCAR(car)
  return result
}
