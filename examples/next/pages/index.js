import { useEffect, useState } from 'react'
import { db, initDb } from '../lib/db.js'
import styles from './index.module.css'

export default function Home() {
  const [dinos, setDinos] = useState([])

  useEffect(() => {
    const coll = db.collection('Dinosaur')
    async function run() {
      await initDb()
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
      <ul className={styles.grid}>
        {dinos.map((dino) => <li className={styles.li} key={dino.id}>{dino.name}</li>)}
      </ul>
    </main>
  )
}
