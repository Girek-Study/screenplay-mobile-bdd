// Carga la configuración en capas y falla temprano si falta algo obligatorio.
//
// El orden importa: .env trae lo común, .env.<plataforma> lo propio de Android o
// iOS, y .env.local lo de cada máquina —el UDID del equipo de cada quien— sin
// tocar los anteriores. Sin esta separación, el .env del repositorio acaba
// pisado en cada pull.

import * as dotenv from 'dotenv';
import * as path from 'path';

declare global {
  // eslint-disable-next-line no-var
  var __ENV_MOVIL_CARGADO__: boolean | undefined;
}

if (!globalThis.__ENV_MOVIL_CARGADO__) {
  const plataforma = (process.env.MOBILE_PLATFORM ?? 'android').trim().toLowerCase();
  const raiz = path.resolve(__dirname, '..', '..', '..');

  // El último que carga NO pisa al anterior: dotenv respeta lo ya definido.
  for (const archivo of ['.env.local', `.env.${plataforma}`, '.env']) {
    dotenv.config({ path: path.join(raiz, archivo), quiet: true });
  }

  globalThis.__ENV_MOVIL_CARGADO__ = true;
}

export {};
