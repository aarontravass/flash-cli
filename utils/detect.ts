import { readFile } from 'node:fs/promises'
import { exists } from './fs.js'

export const detectFramework = async () => {
  if (await exists('_config.ts')) return 'Lume'
  else if (await exists('.next') || await exists('next.config.js')) {
    return 'Next.js'
  } else if (await exists('.nuxt') || await exists('nuxt.config.ts')) {
    return 'Nuxt.js'
  } else return
}

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
