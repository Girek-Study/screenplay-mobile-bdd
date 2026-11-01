# 4. Análisis de riesgos

No todo merece una prueba automatizada. En móvil eso no es una opinión: una suite que
tarda 46 segundos en cuatro escenarios no escala a doscientos, y cada escenario que no
aporta información se paga en cada ejecución, en cada versión de Android y en cada minuto
de granja de dispositivos.

Lo que sigue es cómo decido qué entra, qué se queda en manual y qué no se prueba.

---

## Cómo se prioriza

Dos preguntas, ninguna sobre tecnología:

1. **Si esto falla, ¿qué pasa?** — impacto
2. **¿Cuántas veces al día ocurre?** — frecuencia

Y en móvil, una tercera que en web no existe:

3. **¿Se puede comprobar en otro nivel más barato?** — porque si la respuesta es sí, un
   escenario de extremo a extremo es la forma más cara posible de descubrirlo.

```
        ALTO IMPACTO
             │
   Probar    │   Automatizar
   a mano,   │   primero
   con guion │   ← el ingreso vive aquí
─────────────┼─────────────  FRECUENCIA →
             │
   Anotar    │   Prueba unitaria
   y soltar  │   del componente
             │   ← las validaciones de formato viven aquí
        BAJO IMPACTO
```

Ese cuadrante de abajo a la derecha es el que cambia respecto a web. En web, «automatizar
si sobra tiempo» es razonable: un escenario más cuesta menos de un segundo. En móvil,
cuesta diez, y en una matriz de cuatro dispositivos cuesta cuarenta. **Ahí no sobra
tiempo nunca.**

## La tabla

| Riesgo | Impacto | Frecuencia | Decisión | Por qué |
| --- | --- | --- | --- | --- |
| No se puede entrar | Alto | Altísima | **Automatizado, `@smoke`** | Si esto falla, el resto da igual: nadie llega a probarlo |
| No se puede registrar | Alto | Alta | **Automatizado, `@smoke`** | Es la puerta de entrada de cualquier usuario nuevo |
| El diálogo deja la app atrapada | Alto | Media | **Automatizado, `@regresion`** | Un estado sin salida se percibe como «la app se colgó» |
| Los gestos dejan de funcionar | Medio | Media | **Automatizado, `@regresion`** | Es lo primero que rompe una subida de versión de Appium |
| El botón queda bajo el teclado | Alto | Baja | **Mitigado en el código, no automatizado** | [Abajo tiene su propia sección](#el-teclado-y-los-35-píxeles) |
| La validación de formato falla | Medio | Baja | **Prueba unitaria del componente** | Comprobar una expresión regular arrancando un emulador es desproporcionado |
| El mensaje de error no se anuncia | Alto | Media | **Manual, con TalkBack** | Una aserción sobre el árbol de vistas no prueba que se *oiga* |
| El estado sobrevive a la navegación | Medio | Alta | **Anotado** ([MOV-01](05-hallazgos.md#mov-01)) | Es defecto del producto y a la vez la causa de una decisión del framework |
| Una versión nueva de Android cambia un selector | Alto | Baja | **Matriz de plataformas** | No se previene con un escenario: se descubre corriendo en los extremos |
| Rotación | — | Nula | **No se prueba** | La app está anclada en vertical |
| Permisos del sistema | — | Nula | **No se prueba** | La app no pide ninguno |

---

## Tres decisiones que conviene defender

### El teclado y los 35 píxeles

Este es el riesgo más caro de una suite móvil y el que peor fama tiene, porque se
manifiesta como un fallo intermitente que solo le ocurre a una persona del equipo.

Medido en este emulador, 1080×2400, con el teclado abierto:

```
abajo del botón LOGIN ....... y = 1359 px
arriba del teclado .......... y = 1394 px   (alto del teclado: 1006 px)
                              ───────────
margen ......................      35 px
```

**En este dispositivo el botón se puede pulsar.** Treinta y cinco píxeles de margen. En
uno de 1080×2340 el teclado lo tapa: el clic aterriza sobre una tecla y el escenario falla
con «el elemento no es interactuable», sin que nada haya cambiado en la aplicación.

La decisión es **no automatizar un escenario que compruebe esto**, y en su lugar hacerlo
imposible desde la capa de interacciones: escribir cierra el teclado antes de devolver el
control.

```ts
if (driver.isAndroid && (await driver.isKeyboardShown())) {
  await driver.hideKeyboard();
}
```

El razonamiento: un escenario que comprobara «el botón es visible con el teclado abierto»
pasaría en este emulador y fallaría en el otro, lo que lo convierte en una prueba del
dispositivo disfrazada de prueba del producto. Lo que de verdad hace falta es que **ningún**
escenario dependa de esa suerte. Eso no es un caso de prueba: es una invariante del
framework.

Y sí, es una prevención que tapa un defecto de maquetación real del producto. Está anotado
como tal en [MOV-09](05-hallazgos.md#mov-09), porque una mitigación en las pruebas no
arregla nada para la persona que usa la app.

### La accesibilidad se queda en manual, y no por pereza

Se puede automatizar que el mensaje de error exista en el árbol de vistas. De hecho está:
es un `TextView` con su texto, y `uiautomator` lo ve.

Lo que eso **no** comprueba es que TalkBack lo anuncie cuando aparece. Un `TextView` que se
dibuja no se anuncia solo: hace falta una región activa declarada. Y el nodo no tiene
ninguna pista de que la tenga:

```xml
<node text="Please enter a valid email address"
      resource-id="" content-desc="" focusable="false" ... />
```

Sin id, sin descripción y no enfocable. Una persona con TalkBack puede llegar hasta él
barriendo la pantalla; lo que no va a tener es el aviso en el momento en que pulsa el
botón. Desde fuera, eso se percibe como que el botón no responde.

Automatizar «el `TextView` existe» da una luz verde que **tapa** el problema real. Una
prueba que da confianza falsa es peor que no tenerla. El sitio correcto es una revisión
manual con el lector encendido, una vez, y un linter de accesibilidad en el *pull request*.

### El riesgo que la suite se crea a sí misma

La matriz de plataformas es la mitigación de un riesgo del producto. Pero la propia suite
introduce uno, y conviene escribirlo:

**Los mensajes de error solo se pueden localizar por su texto literal en inglés.** No
tienen `resource-id` ni `content-desc` ([MOV-05](05-hallazgos.md#mov-05)), igual que los
tres campos del formulario comparten un único id ([MOV-04](05-hallazgos.md#mov-04)). Eso
significa que el día que la app se traduzca,
cualquier aserción sobre una validación se cae —y se cae por una razón que no tiene nada
que ver con el defecto que buscaba—.

Es la misma clase de riesgo que en el repositorio web producen los localizadores por texto
con títulos duplicados. No es un defecto del producto: es **una consecuencia de una
decisión de diseño de las pruebas**, tomada porque no había alternativa.

La mitigación barata: pedir al equipo de la app un `testID` en los mensajes de error. Un
atributo, y el riesgo desaparece. La cara: mantener un diccionario de textos esperados por
idioma, que es exactamente el tipo de artefacto que nadie actualiza.

Lo apunto aquí porque un análisis que solo mira al producto se lo pierde, y porque el día
que alguien vea fallar diez escenarios tras un cambio de idioma va a tardar media mañana en
entender por qué.

---

## Qué pasaría si esto fuera una app real

Esta app no tiene cuentas, ni datos personales, ni pagos, ni permisos. En un producto de
verdad —y esta arquitectura ha corrido en suites de banca y retail— la tabla llevaría
cinco filas que aquí no tienen sentido:

- **El diálogo de permisos del sistema en el primer arranque.** Impacto alto, frecuencia
  alta, y es la causa número uno de que una suite móvil falle solo la primera vez.
- **Una interrupción: llamada entrante, notificación, batería baja.** Se prueba que la app
  recupere el estado, no el camino feliz.
- **Pérdida de red a mitad de una operación.** El caso es el camino degradado: qué ve la
  persona, y si lo que escribió sobrevive.
- **La actualización de la app sobre una versión anterior.** Lo que se rompe no es la
  instalación limpia: es la migración de los datos que ya estaban en el teléfono.
- **Biometría y almacén seguro de credenciales.** Impacto alto, y además es lo que un
  auditor mira primero.

Lo digo porque un portafolio con una app de ejemplo puede dar la impresión de que así se
prioriza siempre. No: la técnica es la misma, las filas son otras, y las cinco de arriba
son las que de verdad llenan el presupuesto de una suite móvil.

---

Siguiente: [5. Hallazgos](05-hallazgos.md)
