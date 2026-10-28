import { porPlataforma } from '../../0009.Utils/Selectors/By.Platform';

/** Pantalla de ingreso y registro de la app de ejemplo. */
export class PantallaSesion {
  public static readonly contenedor = '~button-login-container';
  public static readonly pestanaRegistro = '~button-sign-up-container';

  public static readonly campoCorreo = '~input-email';
  public static readonly campoClave = '~input-password';
  public static readonly campoRepetirClave = '~input-repeat-password';

  public static readonly botonIngresar = '~button-LOGIN';
  public static readonly botonRegistrar = '~button-SIGN UP';

  /**
   * El diálogo de confirmación. Aquí la diferencia entre plataformas es real.
   *
   * Y hay una trampa: *parece* un diálogo del sistema, pero sus identificadores
   * llevan el paquete de la aplicación —`com.wdiodemoapp:id/alert_title`— porque
   * lo dibuja AppCompat, no Android. El `android:id/alertTitle` que aparece en
   * todos los tutoriales no existe en esta pantalla.
   *
   * Por eso se busca con `contains`: el selector sigue valiendo aunque la app
   * cambie de nombre de paquete, y vale igual si un día pasa a ser nativo.
   */
  public static get tituloDialogo(): string {
    return porPlataforma({
      android: '//android.widget.TextView[contains(@resource-id, "alert_title")]',
      ios: '-ios predicate string:type == "XCUIElementTypeAlert"',
    });
  }

  public static get mensajeDialogo(): string {
    return porPlataforma({
      android: '//android.widget.TextView[contains(@resource-id, "message")]',
      ios: '-ios class chain:**/XCUIElementTypeStaticText[2]',
    });
  }

  public static get botonAceptarDialogo(): string {
    return porPlataforma({
      android: '//android.widget.Button[@resource-id="android:id/button1"]',
      ios: '~OK',
    });
  }
}
