import type { Actor, Ejecutable } from '../0003.Actors/Actor';
import { ESPERA_VISIBLE } from '../0009.Utils/Config/Timeouts.Config';

/** Escribe texto en un campo, limpiándolo antes. */
export class Escribir implements Ejecutable {
  constructor(
    private readonly texto: string,
    private readonly selector: string,
    private readonly nombre: string,
  ) {}

  static elTexto(texto: string) {
    return {
      en: (selector: string, nombre: string) => new Escribir(texto, selector, nombre),
    };
  }

  async performAs(actor: Actor): Promise<void> {
    const driver = actor.getDriver();
    const campo = await driver.$(this.selector);

    await campo.waitForDisplayed({
      timeout: ESPERA_VISIBLE,
      timeoutMsg: `${actor.name} no encontró el campo "${this.nombre}".`,
    });

    await campo.clearValue();
    await campo.setValue(this.texto);

    // En Android el teclado tapa el botón de envío y el clic siguiente aterriza
    // sobre una tecla. Cerrarlo aquí evita el fallo más común de una suite móvil,
    // que además se reproduce solo en algunos tamaños de pantalla.
    if (driver.isAndroid && (await driver.isKeyboardShown())) {
      await driver.hideKeyboard();
    }
  }
}
