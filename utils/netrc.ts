import kleur from 'kleur'
import { writeFile, appendFile } from 'node:fs/promises'
import { exists, readTextFile } from './fs.js'

export function getHomePath() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
}

export async function addEmailToNetrc(email: string) {
  console.log(kleur.magenta('Adding email to .netrc...'))
  const host = 'flash-dev.vercel.app'
  const homePath = getHomePath()
  const netrcPath = `${homePath}/.netrc`
  // Check if .netrc file exists
  if (await exists(netrcPath)) {
    // Read existing content of .netrc
    const existingContent = await readTextFile(netrcPath)

    // Check if the entry for the host already exists
    if (existingContent.includes(`machine ${host}`)) {
      // Update existing entry with new email
      const updatedContent = existingContent.replace(
        new RegExp(`(machine ${host}\\s+login\\s+)[^\\s]+`),
        `$1${email}`
      )

      // Write updated content back to .netrc file
      await writeFile(netrcPath, updatedContent)
      console.log(`Email for host '${host}' updated successfully in .netrc`)
    } else {
      // Add new entry for the host
      const newEntry = `\nmachine ${host}\n  login ${email}\n`

      // Append new entry to .netrc file
      await appendFile(netrcPath, newEntry)
      console.log(`New entry added to .netrc for host '${host}'.`)
    }
  } else {
    // Create new .netrc file with the entry
    const content = `machine ${host}\n  login ${email}\n`

    await writeFile(netrcPath, content)
    console.log(`.netrc file created with the entry for host '${host}'.`)
  }
}

export async function flashHostExistsInNetrc() {
  const homePath = getHomePath()
  const netrcPath = `${homePath}/.netrc`
  const host = 'flash-dev.vercel.app'
  if (await exists(netrcPath)) {
    const existingContent = await readTextFile(netrcPath)
    // Check if the entry for the host exists
    if (existingContent.includes(`machine ${host}`)) {
      const parsed = parseNetrcContent(existingContent)
      return parsed[host].login
    } else {
      return false
    }
  } else {
    return false
  }
}
function parseNetrcContent(content: string) {
  const machineRegex = /machine\s+(\S+)\s+login\s+(\S+)/g
  const entries = {}
  let match

  while ((match = machineRegex.exec(content))) {
    const [, machine, login] = match
    entries[machine] = { login }
  }

  return entries
}
