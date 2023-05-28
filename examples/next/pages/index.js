import { Polybase } from '@polybase/client'
import { useEffect, useState } from 'react'

const db = new Polybase({ defaultNamespace: 'dinos' })
const coll = db.collection('Dino')

export default function Home() {
  const [dinos, setDinos] = useState([])

  useEffect(() => {
    const interval = setInterval(() => {
      async function run() {
        const { data } = await coll.get()
        setDinos(data.map((x) => x.data))
      }
      run()
    }, 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <main style={{ padding: 48 }}>
      <h1>Dinosaurs</h1>
      <ul>
        {dinos.map((dino) => <li key={dino.id}>{dino.name}</li>)}
      </ul>
    </main>
  )
}
