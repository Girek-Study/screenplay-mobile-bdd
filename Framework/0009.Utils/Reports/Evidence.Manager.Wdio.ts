import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Evidencia de la corrida móvil.
 *
 * En móvil la captura importa más que en web: no hay trace ni vídeo gratis, y
 * reproducir un fallo exige tener el dispositivo, la versión y los datos. La
 * captura del momento exacto suele ser la única prueba que queda.
 */
export class EvidenceManager {
  constructor(private readonly raiz = 'Reports') {}

  nombreSeguro(texto: string): string {
    return texto.replace(/[^\w.-]+/g, '_').slice(0, 110);
  }

  async capturar(driver: WebdriverIO.Browser, escenario: string, sufijo: string): Promise<Buffer> {
    const destino = path.join(this.raiz, 'Screenshots', `${this.nombreSeguro(escenario)}_${sufijo}.png`);
    await fs.ensureDir(path.dirname(destino));

    const base64 = await driver.takeScreenshot();
    const datos = Buffer.from(base64, 'base64');
    await fs.writeFile(destino, datos);

    return datos;
  }
}
