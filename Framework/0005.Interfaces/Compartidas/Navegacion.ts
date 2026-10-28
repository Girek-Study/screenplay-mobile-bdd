import { porPlataforma } from '../../0009.Utils/Selectors/By.Platform';

/**
 * La barra de navegación de la app de ejemplo.
 *
 * Los accessibility id coinciden en Android y iOS porque la app los declara
 * así. Cuando coinciden, se escriben una sola vez: `porPlataforma` es para
 * cuando de verdad difieren, no para repetir la misma cadena dos veces.
 */
export class Navegacion {
  public static readonly pestanaInicio = '~Home';
  public static readonly pestanaSesion = '~Login';
  public static readonly pestanaFormularios = '~Forms';
  public static readonly pestanaDeslizar = '~Swipe';

  /** El título de pantalla sí cambia de clase entre plataformas. */
  public static get tituloPantalla(): string {
    return porPlataforma({
      android: '//android.widget.TextView[@content-desc="Login-screen"]',
      ios: '~Login-screen',
    });
  }
}
