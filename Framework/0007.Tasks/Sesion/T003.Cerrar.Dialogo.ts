import type { Actor, Ejecutable } from '../../0003.Actors/Actor';
import { Pulsar } from '../../0004.Interactions/I002.Pulsar';
import { NoEsVisible } from '../../0008.Questions/Q002.No.Es.Visible';
import { PantallaSesion } from '../../0005.Interfaces/Compartidas/Pantalla.Sesion';

/**
 * Cierra el diálogo del sistema y garantiza que se fue.
 *
 * Un diálogo que tarda en desaparecer intercepta la pulsación siguiente, y el
 * fallo aparece en el paso de después: en otro escenario, con otro mensaje y
 * sin relación visible con la causa.
 */
export class CerrarDialogo implements Ejecutable {
  static ahora(): CerrarDialogo {
    return new CerrarDialogo();
  }

  async performAs(actor: Actor): Promise<void> {
    await actor.attemptsTo(
      Pulsar.en(PantallaSesion.botonAceptarDialogo, 'Aceptar'),
      NoEsVisible.el(PantallaSesion.tituloDialogo, 'diálogo'),
    );
  }
}
