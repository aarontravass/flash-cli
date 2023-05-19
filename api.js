import kleur from 'kleur'
import { NFTStorage } from 'nft.storage'
import { stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { fileSize, walk } from './utils.js'
import { Readable } from 'node:stream'
import { exists } from './utils.js'

export const detectFramework = async () => {
  if (await exists('_config.ts')) return 'Lume'
  else if (await exists('.next') || await exists('next.config.js')) {
    return 'Next.js'
  } else if (await exists('.nuxt') || await exists('nuxt.config.ts')) {
    return 'Nuxt.js'
  }
}
/**
 * @param {string} dir
 * @returns
 */
export const dirData = async (
  dir,
) => {
  let total = 0
  const files = []
  for await (
    const path of walk(dir, {
      includeDirs: false,
      match: [/^[^.].*$/],
    })
  ) {
    const size = (await stat(path)).size
    total += size
    files.push({
      name: dir === '.' ? path : path.replace(dir, ''),
      size,
      stream: () => Readable.toWeb(createReadStream(path)),
    })
  }
  return [total, files]
}

const w3s = new NFTStorage({
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDczNjc4NWZlNzMyNDUzNjBiNThCMDM5NDUwZDVGNkI5NTNCMzU3N2QiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4NDMxOTIwOTY1NywibmFtZSI6InRlc3QifQ.OcimXfIGsq6sXN32Ds_UP_YZt2tdyfBSB_e5qc-Fb54',
})

/**
 * @param {string} folder
 */
export const deployToIpfs = async (folder) => {
  const [total, files] = await dirData(folder)
  if (total === 0) return console.error(kleur.red(`Directory is empty`))
  console.log(kleur.cyan('Deploying on IPFS 🌍'))
  console.log(kleur.white('Pinning service: web3.storage 🛰️'))
  console.log(`Uploading ${fileSize(total)}`)
  const then = performance.now()

  try {
    const result = await w3s.storeDirectory(files)
    console.log(
      `Deployed in ${((performance.now() - then) / 1000).toFixed(3)}s ✨`,
    )
    console.log(`Live on https://${result}.ipfs.dweb.link`)
  } catch (e) {
    console.error(kleur.red(e.message))
  }
}

/**
 * @param {string} framework
 * @param {string?} def
 */
export const getOutputFolder = async (framework, def) => {
  if (!def) {
    switch (framework) {
      case 'Next.js':
        return 'out'
      case 'Lume':
        return '_site'
      case 'Nuxt.js':
        return 'dist'
      default:
        return '.'
    }
  } else return def
}
