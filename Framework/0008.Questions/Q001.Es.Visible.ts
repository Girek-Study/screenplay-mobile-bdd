import type { Actor, Ejecutable } from '../0003.Actors/Actor';
import { ESPERA_VISIBLE } from '../0009.Utils/Config/Timeouts.Config';

/** Comprueba que un elemento está a la vista. */
export class EsVisible implements Ejecutable {
  constructor(
    private readonly selector: string,
    private readonly nombre: string,
    private readonly timeout = ESPERA_VISIBLE,
  ) {}

  static el(selector: string, nombre: string, timeout?: number): EsVisible {
    return new EsVisible(selector, nombre, timeout);
  }

  async performAs(actor: Actor): Promise<void> {
    const elemento = await actor.getDriver().$(this.selector);

    await elemento.waitForDisplayed({
      timeout: this.timeout,
      timeoutMsg: `${actor.name} no vio "${this.nombre}" tras ${this.timeout} ms.`,
    });
  }
}
