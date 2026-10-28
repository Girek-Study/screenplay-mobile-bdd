import { driverFixture } from '../0009.Utils/Lifecycle/Driver.Fixture';

export interface Ejecutable {
  performAs(actor: Actor): Promise<void>;
}

/**
 * Quien ejecuta la prueba sobre el dispositivo.
 *
 * El driver se lee en cada acceso y no se guarda en el constructor: en móvil la
 * sesión se reinicia entre escenarios más a menudo que en web, y un actor con
 * el driver viejo falla con "invalid session id", que no dice nada de la causa.
 */
export class Actor {
  private readonly habilidades: unknown[] = [];

  constructor(public readonly name: string) {}

  getDriver(): WebdriverIO.Browser {
    const driver = driverFixture.driver ?? (globalThis as { browser?: WebdriverIO.Browser }).browser;

    if (!driver) {
      throw new Error(
        `${this.name} no tiene sesión con el dispositivo. ` +
          'El driver lo abre el ciclo de vida: comprueba que Appium esté levantado y el dispositivo conectado.',
      );
    }

    return driver;
  }

  async attemptsTo(...ejecutables: Ejecutable[]): Promise<void> {
    for (const ejecutable of ejecutables) {
      await ejecutable.performAs(this);
    }
  }

  can<T>(habilidad: T): this {
    this.habilidades.push(habilidad);
    return this;
  }
}
