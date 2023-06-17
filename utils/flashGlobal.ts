import { GlobalConfig } from '../types.js'
import { exists, readTextFile } from './fs.js'
import { writeFile } from 'node:fs/promises'
import kleur from 'kleur'

export function getHomePath() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
}

export async function getGlobalFlashConfig() {
  const homePath = getHomePath()
  const flashGlobalPath = `${homePath}/.config/flash-global.json`
  const configExists = await exists(flashGlobalPath)
  if (configExists) {
    const globalConfig = <GlobalConfig>JSON.parse(await readTextFile(flashGlobalPath))
    return globalConfig
  }
  return null
}

export async function updateFlashGlobalConfig(config: GlobalConfig) {
  const homePath = getHomePath()
  const flashGlobalPath = `${homePath}/.config/flash-global.json`
  await writeFile(flashGlobalPath, JSON.stringify(config, null, 2))
  console.log(kleur.magenta('Global flash config updated'))
}
