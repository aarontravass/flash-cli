import { Web3Function } from '@gelatonetwork/web3-functions-sdk'
import { Polybase } from '@polybase/client'

const db = new Polybase({ defaultNamespace: 'dinos' })

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
  const lastBlockStr = (await storage.get('lastBlockNumber')) ?? '0'
  const lastBlock = parseInt(lastBlockStr)

  const newBlock = await multiChainProvider.default().getBlockNumber()
  if (newBlock > lastBlock) await storage.set('lastBlockNumber', newBlock.toString())

  const res = await fetch('https://dinoipsum.com/api/?format=text&paragraphs=1&words=1')
  await db.collection('Dino').create([newBlock.toString(), (await res.text()).trim()])

  return { canExec: false, message: `Saved dino` }
})
