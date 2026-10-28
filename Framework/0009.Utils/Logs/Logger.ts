/** Consola con colores y un prefijo uniforme. Silenciable con QUIET_LOGS=1. */
const silencioso = process.env.QUIET_LOGS === '1';

export const log = {
  paso(mensaje: string): void {
    if (!silencioso) console.log(`\x1b[36m▸\x1b[0m ${mensaje}`);
  },
  ok(mensaje: string): void {
    if (!silencioso) console.log(`\x1b[32m✓\x1b[0m ${mensaje}`);
  },
  fallo(mensaje: string): void {
    console.error(`\x1b[31m✗\x1b[0m ${mensaje}`);
  },
};
