import { cac } from 'cac'
import prompts from 'prompts'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import kleur from 'kleur'
import * as api from './api.js'
import { exists } from './utils.js'

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

const prompt = async () =>
  await prompts([
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
      }, {
        title: 'Filecoin (coming soon)',
        value: 'filecoin',
        disabled: true,
      }],
    },
    {
      name: 'service',
      message: 'Pinning Service',
      type: 'select',
      choices: [{
        title: 'nft.storage',
        value: 'nft.storage',
      }, {
        title: 'Pinata (coming soon)',
        value: 'pinata.cloud',
        disabled: true,
      }, {
        title: 'Estuary (coming soon)',
        value: 'estuary.tech',
        disabled: true,
      }, {
        title: 'Filebase (coming soon)',
        value: 'filebase.com',
        disabled: true,
      }],
    },
  ])

const cli = cac('flash')

cli
  .command(
    '[dir]',
    'Deploy Deploy websites and apps on the new decentralized stack.',
  )
  .action(async (dir) => {
    let config = { storage: 'IPFS', service: 'nft.storage' }
    try {
      config = JSON.parse(await readTextFile('.flashrc'))
    } catch (e) {
      if (e.syscall === 'open') {
        const result = await prompt()

        await writeTextFile('.flashrc', JSON.stringify(result, null, 2))
        config = result
      }
    }
    const framework = await api.detectFramework()
    const folder = await api.getOutputFolder(framework, dir || config.output)
    console.log(
      kleur.cyan(
        framework
          ? `Detected framework: ${framework}`
          : `Uploading static files`,
      ),
    )
    if (config.storage === 'ipfs') {
      await api.deployToIpfs(folder, config.service)
    }
  })

cli.command('init [dir]', 'Initialize a new Flash project').action(
  async (dir) => {
    if (dir) {
      await mkdir(dir)
      process.chdir(dir)
    }
    if (await exists('.flashrc')) {
      return console.error(kleur.red('Project is already initialized'))
    }

    const result = await prompt()

    await writeTextFile('.flashrc', JSON.stringify(result, null, 2))
    console.log(kleur.cyan('✅ Successfully initialized new project'))
  },
)
cli.help()
cli.parse()
