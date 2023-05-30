import { useEffect, useState } from 'react'
import { db } from '../lib/db.js'


export default function Home() {
  const [dinos, setDinos] = useState([])

  useEffect(() => {
    const coll = db.collection('Dino')
    async function run() {
      const { data } = await coll.get()
      setDinos(data.map((x) => x.data))
    }
    run()
    const interval = setInterval(() => {
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
