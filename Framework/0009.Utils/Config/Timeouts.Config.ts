import './Env';

/**
 * Los tiempos de espera, en un solo sitio y con nombre.
 *
 * Un `5000` suelto dentro de una interacción no dice si son cinco segundos
 * porque la app tarda o porque alguien los puso para que dejara de fallar.
 */
const numero = (clave: string, defecto: number): number => {
  const valor = Number(process.env[clave]);
  return Number.isFinite(valor) && valor > 0 ? valor : defecto;
};

/** Esperar a que un elemento aparezca. Lo más común. */
export const ESPERA_VISIBLE = numero('TIMEOUT_VISIBLE', 15_000);

/** Esperar a que un elemento desaparezca: suele ser más rápido. */
export const ESPERA_NO_VISIBLE = numero('TIMEOUT_NO_VISIBLE', 10_000);

/** Pulsar: incluye la espera previa a que el elemento sea pulsable. */
export const ESPERA_PULSACION = numero('TIMEOUT_TAP', 15_000);

/** El límite de un escenario completo. */
export const TIMEOUT_ESCENARIO = numero('CUCUMBER_DEFAULT_TIMEOUT', 120_000);
