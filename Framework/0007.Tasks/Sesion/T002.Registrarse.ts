import type { Actor, Ejecutable } from '../../0003.Actors/Actor';
import { Escribir } from '../../0004.Interactions/I003.Escribir';
import { Pulsar } from '../../0004.Interactions/I002.Pulsar';
import { EsperarVisible } from '../../0004.Interactions/I001.Esperar.Visible';
import { PantallaSesion } from '../../0005.Interfaces/Compartidas/Pantalla.Sesion';
import type { Credenciales } from '../../0006.Models/Credenciales';

/** Cambia a la pestaña de registro y crea una cuenta. */
export class Registrarse implements Ejecutable {
  constructor(private readonly datos: Credenciales) {}

  static con(datos: Credenciales): Registrarse {
    return new Registrarse(datos);
  }

  async performAs(actor: Actor): Promise<void> {
    await actor.attemptsTo(
      Pulsar.en(PantallaSesion.pestanaRegistro, 'pestaña Registro'),
      EsperarVisible.el(PantallaSesion.campoRepetirClave, 'repetir clave'),
      Escribir.elTexto(this.datos.correo).en(PantallaSesion.campoCorreo, 'correo'),
      Escribir.elTexto(this.datos.clave).en(PantallaSesion.campoClave, 'clave'),
      Escribir.elTexto(this.datos.clave).en(PantallaSesion.campoRepetirClave, 'repetir clave'),
      Pulsar.en(PantallaSesion.botonRegistrar, 'Registrarse'),
    );
  }
}
