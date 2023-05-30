import { Web3FunctionBuilder } from '@gelatonetwork/web3-functions-sdk/builder'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import kleur from 'kleur'
import { randomUUID } from 'node:crypto'

export const deployWeb3Function = async (name: string, path: string) => {
  const cid = await Web3FunctionBuilder.deploy(path)
  console.log(`Deploying ${name} on ipfs://${cid}`)
  try {
    const res = await fetch('https://create-gelato-w3f.vercel.app/api/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid, name }),
    })
    if (res.ok) {
      const { tx, taskId } = await res.json()
      console.log(`Success! ${name}-${taskId} -> ${tx.hash}`)
    } else {
      const err = await res.text()
      return console.error(kleur.red(`Failed to deploy ${name}\n${err}`))
    }
  } catch (e) {
    return console.error(kleur.red(`Failed to deploy: ${e.message}`))
  }
}

export const deployFunctions = async () => {
  console.log(kleur.green('Deploying API functions on Gelato'))
  const w3fPath = path.join(process.cwd(), 'web3-functions')
  for (const dir of await readdir(w3fPath)) {
    await deployWeb3Function(
      dir,
      path.join(w3fPath, dir, 'index.ts'),
    )
  }
}
