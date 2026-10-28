// Runner de la suite móvil.
//
// Traduce las etiquetas al formato de WebdriverIO y lanza `wdio` con la
// configuración de la plataforma elegida. El mismo contrato que el runner web:
// `npm test -- --tags "@smoke"`, `npm test "@regresion"` o CUCUMBER_TAGS.

import '../0009.Utils/Config/Env';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { expresionDeEtiquetas } from '../0009.Utils/Helpers/Tags.Util';

const RAIZ = path.resolve(__dirname, '..', '..');
const plataforma = (process.env.MOBILE_PLATFORM ?? 'android').trim().toLowerCase();
const configuracion = path.join(RAIZ, `wdio.mobile.${plataforma}.conf.ts`);

/**
 * Localiza el binario de WebdriverIO.
 *
 * No vale `require.resolve('@wdio/cli/bin/wdio.js')`: el paquete declara
 * `exports` y solo expone su raíz, así que cualquier subruta —incluido su
 * propio `package.json`— se rechaza con ERR_PACKAGE_PATH_NOT_EXPORTED. Hay que
 * resolver la raíz y subir por el árbol hasta el package.json real.
 *
 * Tampoco se usan los `.cmd` de node_modules/.bin: no existen fuera de Windows.
 */
function binarioDeWdio(): string {
  let directorio = path.dirname(require.resolve('@wdio/cli'));

  while (!fs.existsSync(path.join(directorio, 'package.json'))) {
    const padre = path.dirname(directorio);
    if (padre === directorio) throw new Error('No se encontró el package.json de @wdio/cli.');
    directorio = padre;
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(directorio, 'package.json'), 'utf-8')) as {
    bin?: string | Record<string, string>;
  };

  const relativo = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.wdio;
  if (!relativo) throw new Error('@wdio/cli no declara el binario "wdio" en su package.json.');

  return path.join(directorio, relativo);
}

const etiquetas = expresionDeEtiquetas(process.argv.slice(2), process.env.CUCUMBER_TAGS);

const argumentos = [binarioDeWdio(), 'run', configuracion];

if (etiquetas) {
  argumentos.push('--cucumberOpts.tagExpression', etiquetas);
  console.log(`\x1b[36m▸ etiquetas:\x1b[0m ${etiquetas}`);
} else {
  console.log('\x1b[36m▸ etiquetas:\x1b[0m todas');
}

console.log(`\x1b[36m▸ plataforma:\x1b[0m ${plataforma}`);

const resultado = spawnSync(process.execPath, argumentos, {
  stdio: 'inherit',
  env: { ...process.env, MOBILE_PLATFORM: plataforma },
  cwd: RAIZ,
});

process.exit(resultado.status ?? 1);
