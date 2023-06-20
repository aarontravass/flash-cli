#! /usr/bin/env node

import { cac } from 'cac'
import prompts from 'prompts'
import { mkdir, writeFile } from 'node:fs/promises'
import kleur from 'kleur'
import { deployToIpfs } from './api/static.js'
import { exists, readTextFile } from './utils/fs.js'
import { getProjectOutputs } from './utils/detect.js'
import { Config, GlobalConfig } from './types.js'
import pkg from './package.json' assert { type: 'json' }
import { measureDeploymentSpeed } from './utils/perf.js'
import { createIPNS, verifyIPNS } from './utils/ipns.js'
import { getGlobalFlashConfig } from './utils/flashGlobal.js'

const prompt = async (options?: prompts.Options) =>
  await prompts(
    [
      {
        name: 'protocol',
        message: 'Storage Provider',
        type: 'select',
        choices: [
          {
            title: 'IPFS',
            value: 'ipfs',
          },
          {
            title: 'Arweave',
            value: 'arweave',
            disabled: true,
          },
        ],
      },
      {
        name: 'provider',
        message: 'Storage Provider',
        type: 'select',
        choices: (args) =>
          args === 'ipfs'
            ? [
              {
                title: 'nft.storage',
                value: 'nft.storage',
              },
              {
                title: 'web3.storage',
                value: 'web3.storage',
              },
              {
                title: 'Estuary',
                value: 'estuary.tech',
              },
              {
                title: 'Filebase (coming soon)',
                value: 'filebase.com',
                disabled: true,
              },
            ]
            : [
              {
                title: 'Bundlr (coming soon)',
                value: 'bundlr.network',
                disabled: true,
              },
            ],
      },
    ],
    options,
  )

const cli = cac('flash')

cli
  .command(
    '[dir]',
    'Deploy Deploy websites and apps on the new decentralized stack.',
  )
  .option('-s, --static', 'Only deploy static files, not API functions')
  .action(async (dir, options) => {
    let config: Config = {
      protocol: 'ipfs',
      provider: 'nft.storage',
    }
    try {
      config = JSON.parse(await readTextFile('flash.json'))
    } catch (e) {
      if (e.syscall === 'open') {
        const result = await prompt()
        if (!result.protocol || !result.provider) return process.exit(0)

        await writeFile('flash.json', JSON.stringify(result, null, 2))
        config = result as Config
      }
    }

    const folder = await getProjectOutputs(dir || config.output)

    measureDeploymentSpeed(async () => {
      if (config.protocol === 'ipfs') {
        await deployToIpfs(folder, config)
      }
      if ((await exists('web3-functions')) && !options.static) {
        const deployFunctions = await import('./api/functions.js').then(
          (m) => m.deployFunctions,
        )
        await deployFunctions()
      }
    })
  })

cli
  .command('init [dir]', 'Initialize a new Flash project')
  .action(async (dir) => {
    if (dir) {
      await mkdir(dir)
      process.chdir(dir)
    }
    if (await exists('flash.json')) {
      return console.error(kleur.red('Project is already initialized'))
    }

    const result = await prompt()
    await writeFile('flash.json', JSON.stringify(result, null, 2))
    console.log(kleur.cyan('✅ Successfully initialized new project'))
  })

cli
  .command('ci', 'Deploy a project on Flash in a CI/CD environment')
  .option('-s, --static', 'Only deploy static files, not API functions')
  .action(async (options: { static: boolean }) => {
    let config!: Config
    try {
      config = JSON.parse(await readTextFile('flash.json'))
    } catch (e) {
      if (e.syscall === 'open') {
        throw new Error('Project is not initialized: flash.json is missing')
      }
    }
    const folder = await getProjectOutputs(config.output)
    measureDeploymentSpeed(async () => {
      if (config.protocol === 'ipfs') {
        await deployToIpfs(folder, config, true)
      }
      if ((await exists('web3-functions')) && !options.static) {
        const deployFunctions = await import('./api/functions.js').then(
          (m) => m.deployFunctions,
        )
        await deployFunctions()
      }
    })
  })

cli
  .command('ipns <type>', 'Create or Verify a IPNS key')
  .action(async (type: string) => {
    let config!: GlobalConfig | null
    try {
      config = await getGlobalFlashConfig()
    } catch (e) {
      if (e.syscall === 'open') {
        throw new Error('Config file is missing')
      }
    }
    switch (type.toLowerCase()) {
      case 'create':
        await createIPNS(config as GlobalConfig)
        break
      case 'verify':
        await verifyIPNS(config as GlobalConfig)
        break
    }
  })

cli.version(pkg.version)
cli.help()
cli.parse()
