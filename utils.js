import { opendir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { access, constants } from 'node:fs/promises'

let ignored = []

/**
 * @param {string} dir
 */
export async function* walk(dir) {
  if (!ignored.length) {
    ignored = ((await readFile('.gitignore')).toString()).split('\n')
  }
  for await (const d of await opendir(dir)) {
    if (!ignored.includes(d.name)) {
      const entry = path.join(dir, d.name)
      if (d.isDirectory()) yield* walk(entry)
      else if (d.isFile() && !d.name.startsWith('.')) yield entry
    }
  }
}

/**
 * @param {number} bytes
 * @param {number} si
 * @param {number} dp
 * @returns {string}
 */
export function fileSize(bytes, si = false, dp = 1) {
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
export const exists = async (file) => {
  try {
    await access(file, constants.F_OK)
    return true
  } catch {
    return false
  }
}
