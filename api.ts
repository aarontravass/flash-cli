import { colors, exists, format, NFTStorage, readableStreamFromReader, walk } from './deps.ts'

export const detectFramework = async () => {
  if (await exists('_config.ts')) return 'Lume'
  else if (await exists('.next')) return 'Next.js'
}
type FileEntry = { name: string; size: number; stream: () => ReadableStream<Uint8Array> }

export const dirData = async (
  dir: string,
): Promise<[number, FileEntry[]]> => {
  let total = 0
  const files: FileEntry[] = []
  for await (const { isFile, path } of walk(dir, { includeDirs: false, match: [/^[^.].*$/] })) {
    const size = (await Deno.stat(path)).size
    total += size
    const file = await Deno.open(path)
    if (isFile) {
      files.push({
        name: dir === '.' ? path : path.replace(dir, ''),
        size,
        stream: () => readableStreamFromReader(file),
      })
    }
  }
  return [total, files]
}

const w3s = new NFTStorage({
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDczNjc4NWZlNzMyNDUzNjBiNThCMDM5NDUwZDVGNkI5NTNCMzU3N2QiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4NDMxOTIwOTY1NywibmFtZSI6InRlc3QifQ.OcimXfIGsq6sXN32Ds_UP_YZt2tdyfBSB_e5qc-Fb54',
})

export const deployToIpfs = async (folder: string) => {
  const [total, files] = await dirData(folder)
  if (total === 0) return console.error(colors.red(`Directory is empty`))
  console.log(colors.cyan('Deploying on IPFS 🌍'))
  console.log(colors.white('Pinning service: web3.storage 🛰️'))
  console.log(`Uploading ${format(total)}`)
  const then = performance.now()

  try {
    const result = await w3s.storeDirectory(files)
    console.log(`Deployed in ${((performance.now() - then) / 1000).toFixed(3)}s ✨`)
    console.log(`Live on https://${result}.ipfs.dweb.link`)
  } catch (e) {
    console.error(colors.red(e.message))
  }
}
