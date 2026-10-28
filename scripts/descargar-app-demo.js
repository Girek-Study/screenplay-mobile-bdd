// Descarga la app de ejemplo de WebdriverIO (Apache-2.0), que existe para
// Android y para iOS. Esa simetría es justo lo que hace falta para demostrar
// que una misma suite corre en las dos plataformas.
//
//   node scripts/descargar-app-demo.js [android|ios]

const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');

const VERSION = 'v2.2.0';
const BASE = `https://github.com/webdriverio/native-demo-app/releases/download/${VERSION}`;

const APPS = {
  android: {
    archivo: 'android.apk',
    url: `${BASE}/android.wdio.native.app.v2.2.0.apk`,
  },
  ios: {
    archivo: 'ios.zip',
    url: `${BASE}/ios.simulator.wdio.native.app.v2.2.0.zip`,
  },
};

const plataforma = (process.argv[2] ?? 'android').toLowerCase();
const app = APPS[plataforma];

if (!app) {
  console.error(`Plataforma "${plataforma}" desconocida. Usa android o ios.`);
  process.exit(1);
}

const destino = path.join(__dirname, '..', 'apps', app.archivo);

(async () => {
  if (fs.existsSync(destino)) {
    console.log(`Ya estaba descargada: ${destino}`);
    return;
  }

  fs.mkdirSync(path.dirname(destino), { recursive: true });
  console.log(`Descargando ${app.url} …`);

  const respuesta = await fetch(app.url, { redirect: 'follow' });

  if (!respuesta.ok) {
    throw new Error(`La descarga respondió ${respuesta.status}.`);
  }

  // Al archivo temporal primero: una descarga cortada que deja un .apk a medias
  // falla después, en Appium, con un error que no menciona la descarga.
  const temporal = `${destino}.parcial`;
  await pipeline(respuesta.body, fs.createWriteStream(temporal));
  fs.renameSync(temporal, destino);

  const mb = (fs.statSync(destino).size / 1024 / 1024).toFixed(1);
  console.log(`Lista: ${destino} (${mb} MB)`);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
