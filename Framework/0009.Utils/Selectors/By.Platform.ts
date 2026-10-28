import { driverFixture } from '../Lifecycle/Driver.Fixture';

export interface SelectorPorPlataforma {
  android: string;
  ios: string;
}

function esAndroid(): boolean {
  const driver = driverFixture.driver ?? (globalThis as { browser?: WebdriverIO.Browser }).browser;
  return Boolean(driver?.isAndroid);
}

/**
 * Elige el selector según la plataforma en curso.
 *
 * Esta función es la razón de que las tasks sean una sola para Android e iOS.
 * Lo que cambia entre plataformas es *cómo se nombra* un elemento, no qué hace
 * el usuario con él: "iniciar sesión" es la misma tarea en los dos sistemas.
 *
 * Duplicar la capa de tasks por plataforma es el error que convierte una suite
 * móvil en dos suites que se desincronizan en la tercera semana.
 */
export function porPlataforma(selector: SelectorPorPlataforma): string {
  return esAndroid() ? selector.android : selector.ios;
}
