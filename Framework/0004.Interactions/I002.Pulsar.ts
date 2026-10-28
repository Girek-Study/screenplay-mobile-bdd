import type { Actor, Ejecutable } from '../0003.Actors/Actor';
import { ESPERA_PULSACION } from '../0009.Utils/Config/Timeouts.Config';

/**
 * Pulsa un elemento, esperando antes a que esté visible.
 *
 * La espera va dentro de la interacción y no en el escenario: si pulsar exige
 * esperar, esperar es parte de pulsar. Sacarlo fuera obliga a recordarlo en
 * cada uso, y alguien se olvidará.
 */
export class Pulsar implements Ejecutable {
  constructor(
    private readonly selector: string,
    private readonly nombre: string,
    private readonly timeout = ESPERA_PULSACION,
  ) {}

  static en(selector: string, nombre: string, timeout?: number): Pulsar {
    return new Pulsar(selector, nombre, timeout);
  }

  async performAs(actor: Actor): Promise<void> {
    const elemento = await actor.getDriver().$(this.selector);

    await elemento.waitForDisplayed({
      timeout: this.timeout,
      timeoutMsg: `${actor.name} no pudo pulsar "${this.nombre}": no apareció en ${this.timeout} ms.`,
    });

    await elemento.click();
  }
}
