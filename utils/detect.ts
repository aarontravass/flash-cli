import { exists } from './fs.js'
import kleur from 'kleur'

const detectFramework = async () => {
  if (await exists('_config.ts')) return 'Lume'
  else if ((await exists('.next')) || (await exists('next.config.js'))) {
    return 'Next.js'
  } else if ((await exists('.nuxt')) || (await exists('nuxt.config.ts'))) {
    return 'Nuxt.js'
  } else if (
    (await exists('build')) &&
    (await exists('src')) &&
    (await exists('public/index.html'))
  ) {
    return 'Create React App'
  } else return
}

/**
 * @param {string} framework
 * @param {string?} defined
 */
const getOutputFolder = async (framework?: string, defined?: string) => {
  if (!defined) {
    switch (framework) {
      case 'Next.js':
        return 'out'
      case 'Lume':
        return '_site'
      case 'Nuxt.js':
        return 'dist'
      case 'Create React App':
        return 'build'
      default:
        return '.'
    }
  } else return defined
}

export const getProjectOutputs = async (defined?: string) => {
  const framework = await detectFramework()
  const folder = await getOutputFolder(framework, defined)

  console.log(
    kleur.cyan(
      framework ? `Detected framework: ${framework}` : `Uploading static files`
    )
  )
  return folder
}
