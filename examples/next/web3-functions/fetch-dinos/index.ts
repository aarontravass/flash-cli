import { Web3Function } from '@gelatonetwork/web3-functions-sdk'
import { db, initDb } from '../../lib/db.js'

await initDb()

Web3Function.onRun(async ({ storage, multiChainProvider }) => {
  const lastBlock = parseInt((await storage.get('lastBlockNumber')) ?? '0')
  const newBlock = await multiChainProvider.default().getBlockNumber()
  if (newBlock > lastBlock)
    await storage.set('lastBlockNumber', newBlock.toString())

  const res = await fetch(
    'https://dinoipsum.com/api/?format=text&paragraphs=1&words=1'
  )
  if (!res.ok) return { canExec: false, message: `Failed to get a dino` }
  const dino = (await res.text()).trim()
  const coll = db.collection('Dinosaur')
  const records = await coll.get()
  if (records.data.length > 50) {
    for (const rec of records.data) await rec.call('del')
  }
  await coll.create([newBlock.toString(), dino])
  return { canExec: true, message: `Saved dino ${dino}`, callData: [] }
})
