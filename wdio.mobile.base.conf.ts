import * as fs from 'fs-extra';
import * as path from 'node:path';
import './Framework/0009.Utils/Config/Env';
import { MOVIL } from './Framework/0009.Utils/Config/Mobile.Config';
import { TIMEOUT_ESCENARIO } from './Framework/0009.Utils/Config/Timeouts.Config';
import { driverFixture } from './Framework/0009.Utils/Lifecycle/Driver.Fixture';
import { EvidenceManager } from './Framework/0009.Utils/Reports/Evidence.Manager.Wdio';

// El worker de WDIO v9 comparte proceso con ts-node. El chequeo de tipos se
// hace aparte, con `npm run typecheck`: dejarlo activo aquí multiplica por tres
// el arranque de cada worker.
process.env.TS_NODE_TRANSPILE_ONLY = 'true';
process.env.TS_NODE_PROJECT = './tsconfig.json';

const evidencia = new EvidenceManager();

/**
 * La base que comparten Android e iOS.
 *
 * El tipo es `WebdriverIO.Config` y no `Options.Testrunner`: este último no
 * incluye `capabilities`, así que una configuración tipada con él no compila.
 * Y no hay `autoCompileOpts`, que desapareció en la v9 — WebdriverIO compila el
 * TypeScript con tsx por su cuenta. Los ejemplos de la v8 que siguen circulando
 * lo llevan, y con ellos `tsc --noEmit` falla.
 *
 * Va sin `capabilities` a propósito, y el `Omit` lo dice en el tipo: las pone
 * cada plataforma. Dejarlas aquí vacías compilaría y luego abriría una sesión
 * contra el dispositivo equivocado.
 */
export const base: Omit<WebdriverIO.Config, 'capabilities'> = {
  runner: 'local',

  specs: ['./Framework/0001.Features/**/*.feature'],
  maxInstances: 1,

  hostname: MOVIL.appiumHost,
  port: MOVIL.appiumPuerto,
  path: '/',

  logLevel: (process.env.WDIO_LOG_LEVEL as WebdriverIO.Config['logLevel']) ?? 'error',
  waitforTimeout: 15_000,
  connectionRetryTimeout: 180_000,
  connectionRetryCount: 2,

  framework: 'cucumber',
  reporters: ['spec'],

  cucumberOpts: {
    require: ['./Framework/0002.Steps/**/*.ts'],
    timeout: TIMEOUT_ESCENARIO,
    requireModule: [],
    failFast: false,
  },

  // ---- ciclo de vida ----

  async before(_capabilities, _specs, browser) {
    // El driver se publica aquí para que el Actor no dependa del global de WDIO.
    driverFixture.driver = browser as WebdriverIO.Browser;
    await fs.ensureDir('Reports/Screenshots');
  },

  /**
   * Devuelve la app a su pantalla inicial antes de cada escenario.
   *
   * WebdriverIO abre **una sesión por archivo de feature**, no por escenario:
   * todos los escenarios de un mismo .feature comparten el estado de la app. Sin
   * esto, un escenario que termina con un diálogo abierto hace fallar al
   * siguiente — y el error aparece en el escenario inocente, pulsando un botón
   * que el diálogo tapaba.
   *
   * Se cierra y se reabre la app en vez de usar `noReset: false`, que reinstala
   * el paquete entero y multiplica por diez lo que tarda la suite.
   */
  async beforeScenario() {
    const driver = driverFixture.driver;
    if (!driver) return;

    const idApp = driver.isAndroid
      ? MOVIL.android.appPackage
      : (MOVIL.ios.bundleId ?? '');

    if (!idApp) return;

    await driver.execute('mobile: terminateApp', { appId: idApp });
    await driver.execute('mobile: activateApp', { appId: idApp });
  },

  async afterStep(_step, _scenario, resultado) {
    const driver = driverFixture.driver;
    if (!driver) return;

    if (!resultado.passed) {
      await evidencia.capturar(driver, 'paso-fallido', String(Date.now()));
    }
  },

  async afterScenario(mundo, resultado) {
    const driver = driverFixture.driver;
    if (!driver) return;

    const nombre = mundo.pickle.name;
    const sufijo = resultado.passed ? 'OK' : 'FALLO';

    if (resultado.passed && !MOVIL.capturaSiempre) return;

    await evidencia.capturar(driver, nombre, sufijo);
  },

  after() {
    driverFixture.driver = undefined;
  },
};

/** Ruta absoluta de la app, si se indicó una. Appium la exige absoluta. */
export function rutaApp(relativa?: string): string | undefined {
  if (!relativa) return undefined;
  const absoluta = path.resolve(relativa);
  if (!fs.existsSync(absoluta)) {
    throw new Error(`[config] No existe la app en ${absoluta}. Ejecuta "npm run app:descargar".`);
  }
  return absoluta;
}
