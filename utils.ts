import { opendir, readFile, access, constants } from 'node:fs/promises'
import path from 'node:path'

let ignored: string[] = []


export async function* walk(dir: string) {
  if (!ignored.length) {
    try {
      ignored = ((await readFile('.gitignore')).toString()).split('\n')
    } catch {}
  }
  for await (const d of await opendir(dir)) {
    if (!ignored.includes(d.name)) {
      const entry = path.join(dir, d.name)
      if (d.isDirectory()) yield* walk(entry)
      else if (d.isFile() && !d.name.startsWith('.')) yield entry
    }
  }
}


export function fileSize(bytes: number, si = false, dp = 1): string {
  const thresh = si ? 1000 : 1024

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B'
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ;++u
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1
  )

  return bytes.toFixed(dp) + ' ' + units[u]
}

/**
 * @param {string} file
 * @returns
 */
export const exists = async (file: string) => {
  try {
    await access(file, constants.F_OK)
    return true
  } catch {
    return false
  }
}

export const detectFramework = async () => {
  if (await exists('_config.ts')) return 'Lume'
  else if (await exists('.next') || await exists('next.config.js')) {
    return 'Next.js'
  } else if (await exists('.nuxt') || await exists('nuxt.config.ts')) {
    return 'Nuxt.js'
  } else return 
}


/**
 * @param {string} file
 * @returns string
 */
export const readTextFile = async (file: string) => (await readFile(file)).toString()

/**
 * @param {string} framework
 * @param {string?} def
 */
export const getOutputFolder = async (framework?: string, def?: string) => {
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
