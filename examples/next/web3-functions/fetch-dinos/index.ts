import { Web3Function } from '@gelatonetwork/web3-functions-sdk'
import { db } from '../../lib/db.js'

await db.applySchema(`
  @public
  collection Dino {
    id: string;
    name: string;
    constructor (id: string, name: string) {
      this.id = id;
      this.name = name;
    }
  }
`)

Web3Function.onRun(async ({ storage, multiChainProvider }) => {
  const lastBlock = parseInt((await storage.get('lastBlockNumber')) ?? '0')
  const newBlock = await multiChainProvider.default().getBlockNumber()
  if (newBlock > lastBlock) await storage.set('lastBlockNumber', newBlock.toString())

  const res = await fetch('https://dinoipsum.com/api/?format=text&paragraphs=1&words=1')
  const dino = (await res.text()).trim()
  await db.collection('Dino').create([newBlock.toString(), dino])
  return { canExec: false, message: `Saved dino ${dino}` }
})
