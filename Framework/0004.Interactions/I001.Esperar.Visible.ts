import type { Actor, Ejecutable } from '../0003.Actors/Actor';
import { ESPERA_VISIBLE } from '../0009.Utils/Config/Timeouts.Config';

/** Espera a que un elemento esté a la vista. */
export class EsperarVisible implements Ejecutable {
  constructor(
    private readonly selector: string,
    private readonly nombre: string,
    private readonly timeout = ESPERA_VISIBLE,
  ) {}

  static el(selector: string, nombre: string, timeout?: number): EsperarVisible {
    return new EsperarVisible(selector, nombre, timeout);
  }

  async performAs(actor: Actor): Promise<void> {
    // Sin cast: tras el await, `$()` ya devuelve un Element resuelto. Castear a
    // ChainablePromiseElement es lo que hacen los ejemplos de WDIO v8 y en v9
    // rompe el tipado, porque ese tipo dejó de ser genérico.
    const elemento = await actor.getDriver().$(this.selector);

    await elemento.waitForDisplayed({
      timeout: this.timeout,
      timeoutMsg: `${actor.name} esperó ${this.timeout} ms y "${this.nombre}" no apareció.`,
    });
  }
}
