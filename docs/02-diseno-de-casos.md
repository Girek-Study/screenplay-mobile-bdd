# 2. Diseño de casos

Las técnicas de diseño no son un trámite de certificación: son la diferencia entre
veintiocho casos que prueban lo mismo y nueve que cubren el problema.

Aquí están aplicadas sobre las reglas del [análisis funcional](01-analisis-funcional.md),
con el razonamiento a la vista. Y una que en web no hace falta: **la matriz de
plataformas**, que en móvil es la decisión más cara de todas.

---

## Partición de equivalencia — el ingreso

Si dos entradas recorren el mismo camino dentro del programa, probar las dos no aporta
nada. Se prueba una de cada clase.

| Clase | Correo | Clave | Resultado esperado |
| --- | --- | --- | --- |
| **V1** Ambos válidos | `girek@girek-study.com` | 8+ caracteres | Diálogo «Success» |
| **I1** Correo mal formado | `noesuncorreo` | 8+ | «Please enter a valid email address» |
| **I2** Clave corta | válido | 7 caracteres | «Please enter at least 8 characters» |
| **I3** Los dos vacíos | vacío | vacío | **Los dos mensajes a la vez** |

Cuatro casos. Probar `pepe`, `admin@` y `x y@z.com` es repetir **I1** tres veces: las tres
salen por la misma validación de formato.

**I3 es una clase propia y no la suma de I1 e I2**, porque el comportamiento interesante no
es que falle: es que **salen los dos errores simultáneamente**. Si alguien cambia la
validación a «primero el correo, y si está bien mira la clave», I1 e I2 siguen pasando e
I3 cambia sin que nada avise.

Lo que **no** es una clase aparte: un correo con mayúsculas. `A@B.CO` entra igual que
`a@b.co`. Comprobado, y por tanto un solo caso.

## Valores límite — donde de verdad se rompe

Los errores viven en los bordes. Dos fronteras medibles en esta app, y las dos se midieron.

### La longitud de la clave

| Valor | Resultado |
| --- | --- |
| 7 caracteres | Rechazado — «Please enter at least 8 characters» |
| **8 caracteres** | Entra |

La frontera está entre 7 y 8, exactamente donde el mensaje dice. Dos casos, no diez.

### La longitud del dominio de primer nivel

Esta no la dice ningún mensaje. Se encuentra subiendo hasta que algo cambia:

| Correo | Resultado |
| --- | --- |
| `a@b` | Rechazado |
| `a@b.c` | Rechazado — **un carácter de TLD no basta** |
| `a@b.co` | Aceptado |
| `a@b.info` | Aceptado |

El hallazgo útil no es que `a@b.c` se rechace: es que **la app sí tiene una regla de
dominio y no está escrita en ningún sitio**. Un caso de prueba con `test@local` —que es lo
que la gente escribe en un formulario de pruebas— falla, y falla por una razón que nadie
había declarado.

## Tabla de decisión — el registro

Con tres campos y tres validaciones, el número de combinaciones ya no cabe en la cabeza.
Una tabla evita el caso que nadie pensó.

| | C1 | C2 | C3 | C4 | C5 |
| --- | :-: | :-: | :-: | :-: | :-: |
| ¿Correo válido? | No | Sí | Sí | Sí | Sí |
| ¿Clave de 8+? | — | No | Sí | Sí | Sí |
| ¿Confirmación igual? | — | — | No | Sí, vacía | Sí |
| **Resultado** | Error de correo | Error de clave | «same password» | **?** | «Signed Up!» |

**C4 es la columna que una lista escrita a mano se salta siempre**: clave válida y
confirmación vacía. ¿Gana «la confirmación es obligatoria» o gana «las dos claves deben
coincidir»? Son mensajes distintos para la misma situación, y de la respuesta depende qué
lee la persona.

Está marcada con `?` **a propósito**: es un hueco del diseño, no un resultado medido. Una
tabla con una celda honesta vale más que una tabla completa a base de suponer.

## Transición de estados — el diálogo

Lo que importa no son los caminos felices, sino las flechas que **no** deberían existir.

```
                      credenciales válidas
   ┌────────────┐  ──────────────────────────▶  ┌─────────────────┐
   │ Formulario │                               │ Diálogo abierto │
   └────────────┘  ◀──────────────────────────  └─────────────────┘
          │                  «OK»                       │
          │                                             │  ✗ pulsar otra pestaña
          │  ✗ rotar (la app está anclada)              │     NO HACE NADA
          │                                             │
          └── Home → Login ─────────────────────────────┘
                 (conserva campos Y errores)
```

De aquí salen tres casos que una lista plana no produce:

1. **Cerrar el diálogo devuelve el formulario** con lo escrito intacto. Automatizado.
2. **Pulsar otra pestaña con el diálogo abierto no hace nada.** Es un estado atrapado: la
   única salida es «OK». Medido, y es [MOV-03](05-hallazgos.md#mov-03).
3. **Rotar no es una transición.** La app está anclada en vertical. **No se prueba**,
   porque la flecha no existe.

Ese tercero es tan valioso como los otros dos. Un caso que prueba una transición
inexistente siempre pasa, nunca falla, y está en la suite para siempre costando tiempo.

Y el cuarto, que no es un caso sino la causa de una decisión de arquitectura: **salir de la
pestaña y volver conserva el estado anterior, errores incluidos**
([MOV-01](05-hallazgos.md#mov-01)). Por eso esta suite cierra y reabre la app entre
escenarios en lugar de navegar hacia atrás. No es una precaución genérica: es la respuesta
medida a esa flecha.

---

## La matriz de plataformas — la decisión que en web no existe

En web se eligen navegadores y son tres. En móvil, la combinación de sistema, versión y
tamaño de pantalla es infinita y **cada fila cuesta dinero**: un dispositivo, o un minuto
de granja en la nube, en cada ejecución.

La estrategia no es cubrir, es **cubrir los bordes**:

| Eje | Qué se elige | Por qué |
| --- | --- | --- |
| Sistema | Android **y** iOS | La bifurcación del framework está en los selectores; si solo corre una, nadie sabe si la otra sigue viva |
| Versión de Android | La más antigua soportada **y** la más nueva | Los fallos están en los extremos. Las de en medio se comportan como una de las dos |
| Tamaño de pantalla | La **más pequeña** soportada | Un elemento que cabe en la pequeña cabe en todas. Al revés, no |
| Densidad | La que use esa pantalla pequeña | El redondeo de `dp` a píxeles se nota ahí |

**La pantalla pequeña no es un capricho**, y hay un número que lo demuestra. En este
emulador, 1080×2400, con el teclado abierto:

```
abajo del botón LOGIN ....... y = 1359 px
arriba del teclado .......... y = 1394 px
                              ───────────
margen ......................      35 px
```

Treinta y cinco píxeles. En **este** dispositivo el botón se puede pulsar. En uno de
1080×2340 —que existe y es común— el teclado lo tapa, el clic aterriza sobre una tecla, y
el escenario falla con «el elemento no es interactuable» sin que nada haya cambiado en la
aplicación.

Ese es el valor de la fila «pantalla más pequeña»: convierte un fallo intermitente en un
fallo reproducible en el primer dispositivo de la matriz. Está en el
[análisis de riesgos](04-analisis-riesgos.md#el-teclado-y-los-35-píxeles) con su
mitigación.

---

## Lo que se decidió no probar, y por qué

| No se prueba | Motivo |
| --- | --- |
| Rotación de pantalla | La app está anclada en vertical: la transición no existe |
| Permisos del sistema | La app no pide ninguno |
| Notificaciones push | No las hay |
| Interrupciones, como una llamada entrante | Pide un dispositivo con radio; el emulador las simula de una forma que no representa a ninguno |
| Modo oscuro | La app no cambia de tema |
| Red lenta o sin red | No hay servidor al que llamar |
| Biometría | La app la menciona en un texto y no la implementa |

La última fila es la más fácil de equivocar. La pantalla dice literalmente *«When the
device has Touch/FaceID (iOS) or FingerPrint enabled…»*, y un plan de pruebas escrito
leyendo pantallas incluiría un caso de huella. **No hay nada que probar**: es un texto
informativo, no una función.

Escribir esta tabla cuesta cinco minutos y evita la pregunta de «¿y probaste…?» en cada
revisión. Un plan sin exclusiones explícitas obliga a defenderse de memoria.

---

## Los supuestos, marcados como tales

| Supuesto | Si se confirma al revés… |
| --- | --- |
| Los 8 caracteres son una regla de negocio | Si es el valor por defecto de una librería, el umbral se mueve en un `npm update` y el caso límite hay que recalcularlo |
| El correo no debe distinguir mayúsculas | Aparece un caso nuevo: `A@B.CO` no debería entrar |
| Validar solo el formato es suficiente | Aparece una familia entera de casos: dominio inexistente, correo desechable, dominio con tilde |

---

Siguiente: [3. Matriz de trazabilidad](03-matriz-trazabilidad.md)
