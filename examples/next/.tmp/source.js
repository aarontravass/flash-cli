// web3-functions/fetch-dinos/index.ts
import { Web3Function } from "@gelatonetwork/web3-functions-sdk";

// lib/db.js
import { Polybase } from "@polybase/client";
var BASE_URL = `https://testnet.polybase.xyz`;
var db = new Polybase({ defaultNamespace: "dinos", baseURL: `${BASE_URL}/v0` });

// web3-functions/fetch-dinos/index.ts
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
`);
Web3Function.onRun(async ({ storage, multiChainProvider }) => {
  const lastBlock = parseInt(await storage.get("lastBlockNumber") ?? "0");
  const newBlock = await multiChainProvider.default().getBlockNumber();
  if (newBlock > lastBlock)
    await storage.set("lastBlockNumber", newBlock.toString());
  const res = await fetch(
    "https://dinoipsum.com/api/?format=text&paragraphs=1&words=1",
    { method: "GET" }
  );
  await db.collection("Dino").create([newBlock.toString(), (await res.text()).trim()]);
  return { canExec: false, message: "Saved dino" };
});
