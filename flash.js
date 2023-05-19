import { cac } from 'cac'
import prompts from 'prompts'
import { readFile, writeFile } from 'node:fs/promises'
import kleur from 'kleur'
import * as api from './api.js'

/**
 * @param {string} file
 * @returns string
 */
const readTextFile = async (file) => (await readFile(file)).toString()

/**
 * @param {string} file
 * @param {string} content
 */
const writeTextFile = async (file, content) => await writeFile(file, content)

const cli = cac('flash')

cli
  .command(
    '',
    'Deploy Deploy websites and apps on the new decentralized stack.',
  )
  .action(async () => {
    let config = { storage: 'IPFS' }
    try {
      config = JSON.parse(await readTextFile('.flashrc'))
    } catch (e) {
      if (e.syscall === 'open') {
        const result = await prompts([
          {
            name: 'storage',
            message: 'Storage Provider',
            type: 'select',
            choices: [{
              title: 'IPFS',
              value: 'ipfs',
            }, {
              title: 'Arweave (coming soon)',
              value: 'arweave',
              disabled: true,
            }],
          },
        ])

        await writeTextFile('.flashrc', JSON.stringify(result, null, 2))
        config = result
      }
    }
    /**
     * @type {string}
     */
    let folder
    if (!config.output) {
      const framework = await api.detectFramework()
      switch (framework) {
        case 'Next.js':
          folder = 'out'
          break
        case 'Lume':
          folder = '_site'
          break
        default:
          folder = '.'
      }
      console.log(
        kleur.cyan(
          framework
            ? `Detected framework: ${framework}`
            : `Uploading static files`,
        ),
      )
    } else folder = config.output
    if (config.storage === 'ipfs') {
      await api.deployToIpfs(folder)
    }
  })
cli.help()
cli.parse()
