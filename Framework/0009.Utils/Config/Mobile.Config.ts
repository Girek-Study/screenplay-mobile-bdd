import './Env';

type Plataforma = 'android' | 'ios';

function obligatoria(nombre: string): string {
  const valor = (process.env[nombre] ?? '').trim();
  if (!valor) {
    throw new Error(`[config] Falta ${nombre}. Revisa .env, .env.${PLATAFORMA} o .env.local.`);
  }
  return valor;
}

function opcional(nombre: string): string | undefined {
  return (process.env[nombre] ?? '').trim() || undefined;
}

export const PLATAFORMA = ((process.env.MOBILE_PLATFORM ?? 'android').trim().toLowerCase() ||
  'android') as Plataforma;

type ConfigAndroid = Readonly<{ udid?: string; appPackage: string; appActivity: string; app?: string }>;
type ConfigIos = Readonly<{ udid?: string; bundleId?: string; app?: string }>;

let cacheAndroid: ConfigAndroid | undefined;
let cacheIos: ConfigIos | undefined;

/**
 * La configuración del dispositivo.
 *
 * Android e iOS se leen de forma perezosa a propósito: pedir el bundle de iOS
 * al arrancar una corrida de Android hacía fallar la suite por una variable que
 * esa ejecución no iba a usar nunca.
 */
export const MOVIL = {
  proyecto: process.env.PROJECT_NAME ?? 'Suite móvil Screenplay',
  plataforma: PLATAFORMA,

  appiumHost: (process.env.APPIUM_HOST ?? '127.0.0.1').trim(),
  appiumPuerto: Number(process.env.APPIUM_PORT ?? 4723),

  dispositivo: opcional('DEVICE_NAME'),
  versionPlataforma: opcional('PLATFORM_VERSION'),

  capturaSiempre: (process.env.EVIDENCE_ALWAYS_SCREENSHOT ?? '1') === '1',

  get android(): ConfigAndroid {
    cacheAndroid ??= {
      udid: opcional('ANDROID_UDID'),
      appPackage: obligatoria('ANDROID_APP_PACKAGE'),
      appActivity: obligatoria('ANDROID_APP_ACTIVITY'),
      app: opcional('ANDROID_APP'),
    };
    return cacheAndroid;
  },

  get ios(): ConfigIos {
    cacheIos ??= {
      udid: opcional('IOS_UDID'),
      bundleId: opcional('IOS_BUNDLE_ID'),
      app: opcional('IOS_APP'),
    };
    return cacheIos;
  },
};
