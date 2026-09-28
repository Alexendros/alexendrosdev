// Loader para `node --import tsx --loader ./scripts/asset-stub-loader.mjs`:
// los imports de imágenes (astro:assets) devuelven un stub vacío, porque los
// scripts de build (gen-og) solo necesitan los datos, no los píxeles.
const STUBBED = /\.(webp|png|jpe?g|avif|gif|svg)$/;

export async function load(url, context, nextLoad) {
  if (STUBBED.test(url)) {
    return { format: 'module', source: 'export default {};', shortCircuit: true };
  }
  return nextLoad(url, context);
}
