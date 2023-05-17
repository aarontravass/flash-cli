import * as api from './api.ts'
import { colors, Command, prompt, Select } from './deps.ts'

type Config = {
  storage: 'IPFS'
  output?: string
}

await new Command()
  .name('flash')
  .description(
    'Deploy Deploy websites and apps on the new decentralized stack.',
  )
  .version('0.0.0')
  .action(async () => {
    let config: Config = { storage: 'IPFS' }
    try {
      config = JSON.parse(await Deno.readTextFile('.flashrc'))
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        const result = await prompt([
          {
            name: 'storage',
            message: 'Storage Provider',
            type: Select,
            options: ['IPFS', 'Arweave (coming soon)'],
            after: async ({ storage }, next) => {
              if (storage?.includes('coming soon')) {
                return console.log(`${storage.slice(0, storage.indexOf(' '))} is not supported yet`)
              }
              await next()
            },
          },
        ])
        await Deno.writeTextFile('.flashrc', JSON.stringify(result, null, 2))
        config = result as Config
      }
    }
    let folder: string
    if (!config.output) {
      const framework = await api.detectFramework()
      folder = framework === 'Next.js' ? 'out' : '_site'
      console.log(colors.cyan(`Detected framework: ${framework}`))
    } else folder = config.output
    if (config.storage === 'IPFS') {
      await api.deployToIpfs(folder)
    }
  })
  .parse()
