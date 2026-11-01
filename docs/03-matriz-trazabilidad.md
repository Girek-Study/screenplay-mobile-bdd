# 3. Matriz de trazabilidad

De cada regla a su caso, y de cada caso a su escenario automatizado **o al motivo de no
automatizarlo**. La última columna es la que de verdad informa.

Los escenarios citados existen: están en
[`Framework/0001.Features/`](../Framework/0001.Features) y se pueden correr.

---

## Ingreso

| Caso | Regla | Escenario automatizado | Estado |
| --- | --- | --- | --- |
| Entrar con credenciales válidas | R1 | `Ingreso con credenciales válidas` | ✅ `@smoke` |
| Cerrar el diálogo devuelve el formulario | R7 | `Cerrar el diálogo devuelve el formulario` | ✅ `@regresion` |
| Clave de 7 caracteres | R2 | — | ⬜ Pendiente, y es deuda real |
| Clave de 8 caracteres (el límite) | R2 | — | ✅ Cubierto por el caso válido: la clave del `.env` tiene 8+ |
| Correo mal formado | R3 | — | ⬜ Pendiente, y es deuda real |
| TLD de un carácter (`a@b.c`) | R3 | — | ⏸️ Depende de un supuesto sin confirmar |
| Los dos campos vacíos | R5 | — | ⬜ Pendiente |
| `A@B.CO` en mayúsculas | R4 | — | ⏸️ Depende de un supuesto sin confirmar |
| El error se limpia al corregir | R6 | — | 🐞 Hallazgo abierto [MOV-02](05-hallazgos.md#mov-02) |
| El diálogo no bloquea la navegación | R7 | — | 🐞 Hallazgo abierto [MOV-03](05-hallazgos.md#mov-03) |

## Registro

| Caso | Regla | Escenario automatizado | Estado |
| --- | --- | --- | --- |
| Registro de una cuenta nueva | R8 | `Registro de una cuenta nueva` | ✅ `@smoke` |
| Claves que no coinciden | R9 | — | ⬜ Pendiente, y es deuda real |
| Confirmación vacía (columna C4) | R9 | — | ⏸️ El resultado esperado no está definido |
| Cambiar de sub-pestaña conserva lo escrito | R10 | — | ⬜ Pendiente |

## Gestos

| Caso | Regla | Escenario automatizado | Estado |
| --- | --- | --- | --- |
| Deslizar el carrusel de inicio | — | `Deslizar la pantalla de deslizamiento` | ✅ `@regresion` |

Este escenario no cubre ninguna regla de negocio y está ahí a propósito: es el que
demuestra que el deslizamiento está escrito con la API de acciones W3C y no con el
`touchAction` que WebdriverIO 9 eliminó. **Prueba el framework, no el producto**, y la
matriz lo dice en vez de disimularlo.

## Transversal

| Caso | Regla | Escenario automatizado | Estado |
| --- | --- | --- | --- |
| Volver a la pestaña reinicia el formulario | R12 | — | 🐞 Hallazgo abierto [MOV-01](05-hallazgos.md#mov-01) |
| Rotar conserva lo escrito | R11 | — | ⛔ No se prueba: la app está anclada en vertical |
| El botón no queda bajo el teclado | — | — | ⚠️ Mitigado en el framework, no automatizado. [Por qué](04-analisis-riesgos.md#el-teclado-y-los-35-píxeles) |

---

## El recuento, sin maquillar

| | |
| --- | --- |
| Casos diseñados | **17** |
| Automatizados | **4** (24 %) |
| Cubiertos por otro caso | **1** |
| Hallazgos abiertos sin automatizar | **3** |
| Bloqueados por un supuesto o por un resultado sin definir | **3** |
| Descartados porque la transición no existe | **1** |
| Mitigados en el framework, no automatizados | **1** |
| Pendientes sin más motivo que el tiempo | **4** |

**El 24 % es bajo y no lo voy a disfrazar.** Es menos de la mitad del 47 % del
[repositorio web](https://github.com/Girek-Study/screenplay-web-bdd/blob/main/docs/03-matriz-trazabilidad.md),
y el motivo es estructural, no de dejadez:

**Un escenario móvil cuesta entre diez y veinte veces más que uno web.** Levantar un
emulador, instalar la app y arrancar una sesión de Appium son decenas de segundos antes de
la primera aserción. La suite web entera corre en 8 segundos; estos cuatro escenarios
tardan 46. Con esa relación de costes, **la pirámide de pruebas no es un diagrama bonito:
es una restricción de presupuesto**.

Lo que se sigue de ahí, y es la decisión que de verdad importa de este documento:

> En móvil, el extremo a extremo se reserva para **los flujos que solo se pueden comprobar
> en un dispositivo**. Una validación de formato de correo no es uno de ellos: se comprueba
> en la prueba unitaria del componente, donde cuesta milisegundos.

Los cuatro «pendientes sin más motivo que el tiempo» están ahí precisamente por esa duda:
son casos de validación de formulario, y lo honesto es decir que **probablemente no deberían
automatizarse en este nivel** en vez de añadirlos para que la cifra suba.

Los tres hallazgos abiertos siguen la misma regla que en web: primero se corrige, **y
entonces** se automatiza el caso para que no vuelva. Automatizar un escenario que falla a
propósito deja la suite en rojo permanente y, a las dos semanas, nadie mira si está verde.

---

## Por qué la matriz vive aquí y no en una hoja de cálculo

Porque en una hoja de cálculo se desincroniza del código en la primera semana y nadie se
entera. Aquí viaja en el mismo repositorio y en el mismo *pull request* que el cambio: si
alguien añade un escenario y no toca esta tabla, se ve en el diff.

No es una idea original. Es la misma razón por la que la documentación de una API vive
junto al código y no en un wiki.

---

Siguiente: [4. Análisis de riesgos](04-analisis-riesgos.md)
