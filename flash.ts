import { cac } from 'cac'
import prompts from 'prompts'
import { mkdir, writeFile } from 'node:fs/promises'
import kleur from 'kleur'
import { deployFunctions} from './api/functions.js'
import { exists, detectFramework, readTextFile, getOutputFolder } from './utils.js'
import { deployToIpfs } from './api/static.js'

type Config = { storage: string | 'IPFS', service: 'nft.storage' | string, output?: string }

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
    let config: Config = { storage: 'IPFS', service: 'nft.storage' }
    try {
      config = JSON.parse(await readTextFile('.flashrc'))
    } catch (e) {
      if (e.syscall === 'open') {
        const result = await prompt()

        await writeFile('.flashrc', JSON.stringify(result, null, 2))
        config = result
      }
    }
    const framework = await detectFramework()
    const folder = await getOutputFolder(framework, dir || config.output)
    console.log(
      kleur.cyan(
        framework
          ? `Detected framework: ${framework}`
          : `Uploading static files`,
      ),
    )
    const then = performance.now()
    if (config.storage === 'ipfs') {
      await deployToIpfs(folder, config.service)
    }
    // if (await exists('web3-functions')) {
    //   await deployFunctions()
    // }
    try {
      console.log(
        `Deployed in ${((performance.now() - then) / 1000).toFixed(3)}s ✨`,
      )
    } catch (e) {
      console.error(kleur.red(e.message))
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

    await writeFile('.flashrc', JSON.stringify(result, null, 2))
    console.log(kleur.cyan('✅ Successfully initialized new project'))
  },
)
cli.help()
cli.parse()
