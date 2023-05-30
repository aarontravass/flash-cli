import { Polybase } from '@polybase/client'

export const db = new Polybase({ defaultNamespace: 'dinos', baseURL:`${process.env.NEXT_PUBLIC_API_URL}/v0` })
