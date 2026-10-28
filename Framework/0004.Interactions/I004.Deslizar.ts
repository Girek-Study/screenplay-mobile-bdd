import type { Actor, Ejecutable } from '../0003.Actors/Actor';

type Direccion = 'arriba' | 'abajo' | 'izquierda' | 'derecha';

/**
 * Desliza la pantalla usando la API de acciones W3C.
 *
 * `touchAction` quedó obsoleto en WebdriverIO v8 y eliminado en v9: las guías
 * que siguen circulando por internet lo usan, y por eso esta interacción existe
 * escrita con `performActions`.
 */
export class Deslizar implements Ejecutable {
  constructor(
    private readonly direccion: Direccion,
    private readonly proporcion = 0.5,
  ) {}

  static hacia(direccion: Direccion, proporcion?: number): Deslizar {
    return new Deslizar(direccion, proporcion);
  }

  async performAs(actor: Actor): Promise<void> {
    const driver = actor.getDriver();
    const { width, height } = await driver.getWindowSize();

    const centroX = Math.round(width / 2);
    const centroY = Math.round(height / 2);
    const recorridoX = Math.round((width * this.proporcion) / 2);
    const recorridoY = Math.round((height * this.proporcion) / 2);

    const destino = {
      arriba: { x: centroX, y: centroY - recorridoY },
      abajo: { x: centroX, y: centroY + recorridoY },
      izquierda: { x: centroX - recorridoX, y: centroY },
      derecha: { x: centroX + recorridoX, y: centroY },
    }[this.direccion];

    await driver.performActions([
      {
        type: 'pointer',
        id: 'dedo',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centroX, y: centroY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 600, x: destino.x, y: destino.y },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);

    await driver.releaseActions();
  }
}
