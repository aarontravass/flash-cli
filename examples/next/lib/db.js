import { Polybase } from '@polybase/client'

const BASE_URL = `https://testnet.polybase.xyz`

export const db = new Polybase({ defaultNamespace: 'dinos', baseURL:`${BASE_URL}/v0` })
