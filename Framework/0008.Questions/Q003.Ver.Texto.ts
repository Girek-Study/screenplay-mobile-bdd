import type { Actor, Ejecutable } from '../0003.Actors/Actor';
import { ESPERA_VISIBLE } from '../0009.Utils/Config/Timeouts.Config';

/**
 * Comprueba que un elemento contiene un texto.
 *
 * Se reintenta con `waitUntil` en vez de leer el texto una sola vez: en móvil,
 * entre que un diálogo aparece y termina su animación, el texto puede llegar
 * vacío. Leerlo de golpe produce el fallo intermitente que todo el mundo achaca
 * al emulador.
 */
export class VerTexto implements Ejecutable {
  constructor(
    private readonly esperado: string,
    private readonly selector: string,
    private readonly nombre: string,
  ) {}

  static el(esperado: string) {
    return {
      en: (selector: string, nombre: string) => new VerTexto(esperado, selector, nombre),
    };
  }

  async performAs(actor: Actor): Promise<void> {
    const driver = actor.getDriver();
    const elemento = await driver.$(this.selector);

    await elemento.waitForDisplayed({ timeout: ESPERA_VISIBLE });

    let leido = '';

    await driver.waitUntil(
      async () => {
        leido = (await elemento.getText()) ?? '';
        return leido.includes(this.esperado);
      },
      {
        timeout: ESPERA_VISIBLE,
        interval: 250,
        timeoutMsg: `En "${this.nombre}" se esperaba «${this.esperado}» y se leyó «${leido}».`,
      },
    );
  }
}
