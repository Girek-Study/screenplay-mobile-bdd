export const MAX_LARGO_ARG = 4096;

/** Quita las comillas que la shell de Windows deja pegadas al argumento. */
export function sinComillas(texto: string): string {
  if (!texto) return texto;

  let valor = texto.length > MAX_LARGO_ARG ? texto.slice(0, MAX_LARGO_ARG) : texto;
  let inicio = 0;
  let fin = valor.length;

  while (inicio < fin && (valor[inicio] === '"' || valor[inicio] === "'")) inicio += 1;
  while (fin > inicio && (valor[fin - 1] === '"' || valor[fin - 1] === "'")) fin -= 1;

  return valor.slice(inicio, fin);
}

/** Resuelve la expresión de etiquetas desde los argumentos o el entorno. */
export function expresionDeEtiquetas(argv: string[], etiquetasEntorno?: string): string | undefined {
  const limpios = (Array.isArray(argv) ? argv : []).map(sinComillas);
  const indice = limpios.indexOf('--tags');

  if (indice !== -1 && limpios[indice + 1]) return limpios[indice + 1];

  const soloEtiquetas = limpios.length > 0 && limpios.every((a) => a.startsWith('@'));
  if (soloEtiquetas) return limpios.join(' ');

  if (limpios.length === 1 && limpios[0].includes('@')) return limpios[0];

  return (etiquetasEntorno ?? '').trim() || undefined;
}
