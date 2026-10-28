import type { Actor, Ejecutable } from '../../0003.Actors/Actor';
import { Escribir } from '../../0004.Interactions/I003.Escribir';
import { Pulsar } from '../../0004.Interactions/I002.Pulsar';
import { PantallaSesion } from '../../0005.Interfaces/Compartidas/Pantalla.Sesion';
import type { Credenciales } from '../../0006.Models/Credenciales';

/**
 * Inicia sesión con unas credenciales.
 *
 * Una sola task para Android y iOS. Lo que cambia entre plataformas son los
 * selectores, y de eso se encarga `porPlataforma` dentro de la interface.
 * Duplicar la capa de tasks por plataforma es lo que convierte una suite móvil
 * en dos suites que se desincronizan.
 */
export class IniciarSesion implements Ejecutable {
  constructor(private readonly datos: Credenciales) {}

  static con(datos: Credenciales): IniciarSesion {
    return new IniciarSesion(datos);
  }

  async performAs(actor: Actor): Promise<void> {
    await actor.attemptsTo(
      Escribir.elTexto(this.datos.correo).en(PantallaSesion.campoCorreo, 'correo'),
      Escribir.elTexto(this.datos.clave).en(PantallaSesion.campoClave, 'clave'),
      Pulsar.en(PantallaSesion.botonIngresar, 'Ingresar'),
    );
  }
}
