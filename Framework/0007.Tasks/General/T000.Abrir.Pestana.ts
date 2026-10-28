import type { Actor, Ejecutable } from '../../0003.Actors/Actor';
import { Pulsar } from '../../0004.Interactions/I002.Pulsar';
import { EsperarVisible } from '../../0004.Interactions/I001.Esperar.Visible';

/** Abre una pestaña de la barra inferior y espera a que su contenido cargue. */
export class AbrirPestana implements Ejecutable {
  constructor(
    private readonly pestana: string,
    private readonly contenido: string,
    private readonly nombre: string,
  ) {}

  static la(pestana: string, contenido: string, nombre: string): AbrirPestana {
    return new AbrirPestana(pestana, contenido, nombre);
  }

  async performAs(actor: Actor): Promise<void> {
    await actor.attemptsTo(
      Pulsar.en(this.pestana, `pestaña ${this.nombre}`),
      EsperarVisible.el(this.contenido, `contenido de ${this.nombre}`),
    );
  }
}
