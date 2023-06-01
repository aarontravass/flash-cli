import { cac } from 'cac'
import prompts from 'prompts'
import { mkdir, writeFile } from 'node:fs/promises'
import kleur from 'kleur'
import { deployFunctions } from './api/functions.js'
import { deployToIpfs } from './api/static.js'
import { exists, readTextFile } from './utils/fs.js'
import { detectFramework, getOutputFolder } from './utils/detect.js'
import { Config } from './types.js'
import { addEmailToNetrc, flashHostExistsInNetrc } from './utils/netrc.js'

const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
const prompt = async () =>
  await prompts([
    {
      name: 'storage',
      message: 'Storage Provider',
      type: 'select',
      choices: [
        {
          title: 'IPFS',
          value: 'ipfs',
        },
      ],
    },
    {
      name: 'service',
      message: 'Pinning Service',
      type: 'select',
      choices: [
        {
          title: 'nft.storage',
          value: 'nft.storage',
        },
        {
          title: 'web3.storage',
          value: 'web3.storage',
        },
        {
          title: 'Estuary (coming soon)',
          value: 'estuary.tech',
          disabled: true,
        },
        {
          title: 'Filebase (coming soon)',
          value: 'filebase.com',
          disabled: true,
        },
      ],
    },
    {
      name: 'email',
      type: 'text',
      message: 'What is your email address?',
      validate: value => (!emailPattern.test(value) ? 'Invalid email' : true),
    },
  ])

const emailPrompt = async () =>
  await prompts([
    {
      name: 'email',
      type: 'text',
      message: 'What is your email address?',
      validate: value => (!emailPattern.test(value) ? 'Invalid email' : true),
    },
  ])

const cli = cac('flash')

cli
  .command(
    '[dir]',
    'Deploy Deploy websites and apps on the new decentralized stack.'
  )
  .action(async dir => {
    let config: Config = {
      storage: 'ipfs',
      service: 'nft.storage',
      email: 'hello@example.com',
    }
    try {
      config = JSON.parse(await readTextFile('flash.json'))
    } catch (e) {
      if (e.syscall === 'open') {
        const result = await prompt()

        await writeFile('flash.json', JSON.stringify(result, null, 2))
        config = result as Config
      }
    }
    const framework = await detectFramework()
    const folder = await getOutputFolder(framework, dir || config.output)
    console.log(
      kleur.cyan(
        framework
          ? `Detected framework: ${framework}`
          : `Uploading static files`
      )
    )
    const then = performance.now()
    if (config.storage === 'ipfs') {
      // use email from netrc or prompt user for email if it doesn't exist
      const emailConfigExists = await flashHostExistsInNetrc()
      if (!emailConfigExists) {
        const result = await emailPrompt()
        config.email = result.email
        await addEmailToNetrc(result.email)
      } else {
        config.email = emailConfigExists
      }
      await deployToIpfs(folder, config)
    }
    if (await exists('web3-functions')) {
      await deployFunctions()
    }
    try {
      console.log(
        `Deployed in ${((performance.now() - then) / 1000).toFixed(3)}s ✨`
      )
    } catch (e) {
      console.error(kleur.red(e.message))
    }
  })

cli
  .command('init [dir]', 'Initialize a new Flash project')
  .action(async dir => {
    if (dir) {
      await mkdir(dir)
      process.chdir(dir)
    }
    if (await exists('flash.json')) {
      return console.error(kleur.red('Project is already initialized'))
    }

    const result = await prompt()
    const { email, ...rest } = result

    await addEmailToNetrc(email)
    await writeFile('flash.json', JSON.stringify(rest, null, 2))
    console.log(kleur.cyan('✅ Successfully initialized new project'))
  })
cli.help()
cli.parse()
