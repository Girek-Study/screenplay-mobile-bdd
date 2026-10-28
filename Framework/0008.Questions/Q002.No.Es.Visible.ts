import type { Actor, Ejecutable } from '../0003.Actors/Actor';
import { ESPERA_NO_VISIBLE } from '../0009.Utils/Config/Timeouts.Config';

/** Comprueba que un elemento NO está a la vista. */
export class NoEsVisible implements Ejecutable {
  constructor(
    private readonly selector: string,
    private readonly nombre: string,
    private readonly timeout = ESPERA_NO_VISIBLE,
  ) {}

  static el(selector: string, nombre: string, timeout?: number): NoEsVisible {
    return new NoEsVisible(selector, nombre, timeout);
  }

  async performAs(actor: Actor): Promise<void> {
    const elemento = await actor.getDriver().$(this.selector);

    await elemento.waitForDisplayed({
      timeout: this.timeout,
      reverse: true,
      timeoutMsg: `"${this.nombre}" seguía a la vista tras ${this.timeout} ms.`,
    });
  }
}
