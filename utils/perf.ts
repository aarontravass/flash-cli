import kleur from "kleur"

export const measureDeploymentSpeed = async (fn: () => void | Promise<void>) => {
  const then = performance.now()
  await fn()

  try {
    console.log(
      `Deployed in ${((performance.now() - then) / 1000).toFixed(3)}s ✨`
    )
  } catch (e) {
    console.error(kleur.red(e.message))
  }
}