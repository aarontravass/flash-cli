import { Polybase } from '@polybase/client'

const BASE_URL = `https://testnet.polybase.xyz`

export const db = new Polybase({ defaultNamespace: 'dinosaurs', baseURL:`${BASE_URL}/v0` })

export const initDb = async () => {
  await db.applySchema(`
  @public
  collection Dinosaur {
    id: string;
    name: string;
    constructor (id: string, name: string) {
      this.id = id;
      this.name = name;
    }
    del () {
      selfdestruct();
    }
  }
`)
}