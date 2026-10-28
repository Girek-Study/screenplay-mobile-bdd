import '../0009.Utils/Config/Env';

export interface Credenciales {
  readonly rol: string;
  readonly correo: string;
  readonly clave: string;
}

/**
 * Las credenciales salen del entorno.
 *
 * La app de ejemplo acepta cualquier correo con formato válido, así que los
 * valores por defecto son inofensivos. En un proyecto real este archivo es el
 * único que cambia entre entornos, y los valores vienen del gestor de secretos
 * del CI.
 */
export const CREDENCIALES: Record<string, Credenciales> = {
  valido: {
    rol: 'usuario registrado',
    correo: process.env.CORREO_DEMO ?? 'girek@girek-study.com',
    clave: process.env.CLAVE_DEMO ?? 'Clave.Segura.2026',
  },
  correoMalFormado: {
    rol: 'usuario que escribió mal el correo',
    correo: 'girek@',
    clave: process.env.CLAVE_DEMO ?? 'Clave.Segura.2026',
  },
};

export function credenciales(clave: string): Credenciales {
  const encontradas = CREDENCIALES[clave];

  if (!encontradas) {
    throw new Error(`No existe el perfil "${clave}". Definidos: ${Object.keys(CREDENCIALES).join(', ')}.`);
  }

  return encontradas;
}
