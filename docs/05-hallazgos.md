# 5. Hallazgos

Nueve, de una sesión de exploración sobre un emulador Android API 36 con la app de ejemplo
v2.2.0. Todos reproducibles: se levanta el emulador, se instala la app y se siguen los
pasos.

**Se llaman hallazgos y no defectos a propósito.** Cuatro de los nueve no son fallos del
producto: son decisiones suyas que encarecen o fragilizan las pruebas. Mezclar las dos
cosas bajo la palabra «defecto» es la forma más rápida de que un equipo de desarrollo deje
de leer los informes de QA.

Ninguno lo detecta la suite de este repositorio, y eso es
[lo más interesante de esta carpeta](README.md#el-resultado-incómodo).

| Id | Resumen | Tipo | Severidad |
| --- | --- | --- | :-: |
| [MOV-01](#mov-01) | Volver a la pestaña conserva los campos y el error anterior | Producto | **Alta** |
| [MOV-02](#mov-02) | El error del correo no se limpia al corregirlo | Producto | Baja |
| [MOV-03](#mov-03) | El diálogo deja la app atrapada sin decir por qué | Producto | Media |
| [MOV-04](#mov-04) | Tres campos distintos comparten el mismo identificador | Testabilidad | Media |
| [MOV-05](#mov-05) | Los mensajes de error solo se pueden localizar por su texto en inglés | Testabilidad | **Alta** |
| [MOV-06](#mov-06) | El diálogo mezcla identificadores de AppCompat y de la plataforma | Testabilidad | Media |
| [MOV-07](#mov-07) | Un campo vacío se reporta como «formato inválido» | Producto | Baja |
| [MOV-08](#mov-08) | El árbol de accesibilidad expone la longitud de la clave | Producto | Baja |
| [MOV-09](#mov-09) | El botón de ingresar queda a 35 px del teclado | Producto | Media |

---

## MOV-01

**Volver a la pestaña conserva los campos y el error anterior**

| | |
| --- | --- |
| **Pasos** | 1. Pestaña Login → Sign up.<br>2. Escribir correo, clave y una confirmación distinta.<br>3. Pulsar «SIGN UP» → aparece «Please enter the same password».<br>4. Pulsar «Home» en la barra inferior.<br>5. Volver a pulsar «Login». |
| **Esperado** | El formulario vuelve limpio, o al menos sin el error de un intento anterior |
| **Obtenido** | Los tres campos siguen rellenos, sigue en la sub-pestaña de registro, y **el mensaje de error sigue a la vista** |
| **Severidad** | Alta |

Medido: tras el viaje Home → Login, el volcado del árbol es idéntico al de antes de salir,
incluido `text="Please enter the same password"`.

Importa por dos razones distintas.

**Para la persona**: vuelve a una pantalla que le está diciendo que algo está mal sin que
haya hecho nada. El error ya no describe el estado actual, describe un intento que ya pasó.

**Para las pruebas**: es la causa raíz de una decisión de arquitectura de esta suite. Los
escenarios de un mismo archivo `.feature` comparten sesión, y un escenario que termina con
el formulario sucio contamina al siguiente —que falla, además, en un sitio que no tiene
nada que ver—. Por eso aquí la app se cierra y se reabre entre escenarios:

```ts
await driver.execute('mobile: terminateApp', { appId: idApp });
await driver.execute('mobile: activateApp', { appId: idApp });
```

Dos órdenes, décimas de segundo. Esa línea existe **por este hallazgo**, no por costumbre.

## MOV-02

**El error del correo no se limpia al corregirlo**

| | |
| --- | --- |
| **Pasos** | 1. Pulsar «LOGIN» con los campos vacíos → salen los dos errores.<br>2. Escribir un correo válido, `girek@girek-study.com`, **sin reenviar**. |
| **Esperado** | El error del correo desaparece al dejar de ser cierto |
| **Obtenido** | «Please enter a valid email address» sigue debajo de un correo perfectamente válido |
| **Severidad** | Baja |

La validación se recalcula al enviar, no al escribir. Ruido, no bloqueo.

Se anota de todas formas, por lo mismo que en el repositorio web: **para no volver a
encontrarlo dentro de seis meses y gastar otra vez el tiempo de investigarlo.** Un registro
de hallazgos sirve tanto para arreglar como para no volver a descubrir lo mismo.

## MOV-03

**El diálogo deja la app atrapada sin decir por qué**

| | |
| --- | --- |
| **Pasos** | 1. Entrar con credenciales válidas → aparece el diálogo «Success».<br>2. **Sin cerrarlo**, pulsar «Forms» en la barra inferior. |
| **Esperado** | Se navega, o algo indica que hay que cerrar el diálogo primero |
| **Obtenido** | No pasa absolutamente nada. La barra se ve, se puede pulsar y no responde |
| **Severidad** | Media |

Medido: tras pulsar «Forms», el volcado del árbol sigue mostrando el diálogo y ninguna
pantalla nueva.

Es correcto que un modal bloquee: para eso es modal. Lo que no se sostiene es que **la barra
de navegación siga pintada, habilitada y pulsable** mientras no hace nada. Desde fuera,
pulsar un botón visible y que no ocurra nada es indistinguible de una app colgada, y la
reacción natural es volver a pulsar, y después matar la app.

Dos arreglos y los dos valen: oscurecer la barra mientras el diálogo esté abierto, o
cerrar el diálogo al navegar.

## MOV-04

**Tres campos distintos comparten el mismo identificador**

| | |
| --- | --- |
| **Pasos** | Abrir Login → Sign up y volcar el árbol de vistas. |
| **Esperado** | Un identificador por campo |
| **Obtenido** | Los tres `EditText` llevan `resource-id="RNE__Input__text-input"` |
| **Tipo** | Testabilidad |
| **Severidad** | Media |

```
EditText  desc=input-email            id=RNE__Input__text-input
EditText  desc=input-password         id=RNE__Input__text-input
EditText  desc=input-repeat-password  id=RNE__Input__text-input
```

Es el id que React Native Elements pone a todos sus inputs, así que no es un descuido de
quien escribió la pantalla: es el valor por defecto de la librería, que nadie sobreescribió.

Consecuencia concreta: un selector por id devuelve tres elementos, y la prueba falla o —peor—
escribe en el campo equivocado y pasa igual. Lo único que distingue los campos es el
`content-desc`.

Por eso **toda la capa de interfaces de esta suite usa accessibility id**:

```ts
public static readonly campoCorreo = '~input-email';
```

No es una preferencia de estilo. Aquí es la única opción que funciona.

## MOV-05

**Los mensajes de error solo se pueden localizar por su texto en inglés**

| | |
| --- | --- |
| **Pasos** | Provocar cualquier error de validación y volcar el nodo. |
| **Esperado** | Un `resource-id` o un `content-desc` estable |
| **Obtenido** | Ninguno de los dos, y el nodo no es enfocable |
| **Tipo** | Testabilidad, y también accesibilidad |
| **Severidad** | Alta |

```xml
<node text="Please enter a valid email address"
      resource-id="" content-desc="" focusable="false"
      class="android.widget.TextView" ... />
```

Dos consecuencias, y la segunda es la grave.

**Para las pruebas**: la única forma de encontrar el mensaje es su texto literal. El día
que la app se traduzca, cualquier aserción sobre una validación se cae, y se cae por una
razón que no tiene nada que ver con el defecto que buscaba. Está desarrollado en el
[análisis de riesgos](04-analisis-riesgos.md#el-riesgo-que-la-suite-se-crea-a-sí-misma).

**Para quien usa un lector de pantalla**: el mensaje está en el árbol, así que se puede
alcanzar barriendo la pantalla. Lo que no hay es ninguna señal de que deba anunciarse al
aparecer. Desde fuera, eso se percibe como que el botón «LOGIN» no responde.

Aquí conviene ser exacto con el límite de la medición: **el volcado de `uiautomator` no dice
si hay una región activa declarada.** Lo que sí dice es que no hay id, no hay descripción y
el nodo no es enfocable, que son las tres cosas que uno esperaría en un mensaje pensado para
ser anunciado. La comprobación definitiva es encender TalkBack y escuchar, y por eso ese
caso está en la tabla de riesgos como manual y no como automatizado.

Se arregla con un atributo. Es alta por eso: el coste del arreglo es ridículo comparado con
lo que cuesta no tenerlo.

## MOV-06

**El diálogo mezcla identificadores de AppCompat y de la plataforma**

| | |
| --- | --- |
| **Pasos** | Entrar con credenciales válidas y volcar el diálogo. |
| **Esperado** | Una familia de identificadores, la que sea |
| **Obtenido** | El título es de la app; el mensaje y el botón son de la plataforma |
| **Tipo** | Testabilidad |
| **Severidad** | Media |

| Parte | Identificador |
| --- | --- |
| Título | `com.wdiodemoapp:id/alert_title` |
| Mensaje | `android:id/message` |
| Botón «OK» | `android:id/button1` |

Parece un diálogo del sistema y lo es a medias: lo dibuja AppCompat, que mantiene los ids
de plataforma para unas partes y pone los suyos en otras.

El efecto práctico: **el `android:id/alertTitle` que aparece en todos los tutoriales no
existe en esta pantalla.** Quien lo copia obtiene un «elemento no encontrado» buscando el
primer elemento que iba a tocar, y lo normal es sospechar de la instalación de Appium antes
que del tutorial.

Y la prueba de que la distinción es real, no teórica: en este mismo emulador, el diálogo
«Bluetooth keeps stopping» que apareció al arrancar **sí** usa `android:id/alertTitle`. Los
dos conviven, y un selector escrito para uno no sirve para el otro.

La mitigación está en la capa 5 y es una línea:

```ts
android: '//android.widget.TextView[contains(@resource-id, "alert_title")]',
```

`contains` en vez de igualdad: el selector sigue valiendo si la app cambia de nombre de
paquete, y vale igual si un día el diálogo pasa a ser nativo.

## MOV-07

**Un campo vacío se reporta como «formato inválido»**

| | |
| --- | --- |
| **Pasos** | Pulsar «LOGIN» con los dos campos vacíos. |
| **Esperado** | «Este campo es obligatorio» |
| **Obtenido** | «Please enter a valid email address» |
| **Severidad** | Baja |

Un campo vacío no tiene un formato inválido: no tiene formato. El mensaje manda a la
persona a revisar lo que escribió cuando el problema es que no escribió nada.

Es menor y se arregla con una condición. Lo incluyo porque es exactamente el tipo de
detalle que una suite automatizada nunca va a reportar: el escenario comprueba que
*aparece un error*, y aparece.

## MOV-08

**El árbol de accesibilidad expone la longitud de la clave**

| | |
| --- | --- |
| **Pasos** | Escribir una clave de 12 caracteres y volcar el nodo del campo. |
| **Esperado** | Un valor opaco, o ninguno |
| **Obtenido** | `text="••••••••••••"` — exactamente un punto por carácter |
| **Severidad** | Baja |

Medido con dos claves distintas: 8 caracteres dan 8 puntos, 12 dan 12. El enmascarado es
visual; la longitud viaja en claro en el árbol de accesibilidad.

No es una filtración de la clave y no lo voy a presentar como tal. Es una filtración de
**metadato**: cualquier app con permiso de accesibilidad en el dispositivo puede leer
cuántos caracteres tiene la clave de esta persona, que es justo el dato que reduce el
espacio de búsqueda de un ataque por fuerza bruta.

Y tiene un efecto en el diseño de pruebas que conviene saber: **desde la prueba se puede
aseverar la longitud de la clave, no su contenido.** Un escenario que intente comprobar
«la clave escrita es la correcta» mirando el campo está comprobando otra cosa.

## MOV-09

**El botón de ingresar queda a 35 px del teclado**

| | |
| --- | --- |
| **Pasos** | 1. Abrir Login.<br>2. Pulsar el campo de clave para que suba el teclado.<br>3. Medir. |
| **Esperado** | Un margen que no dependa del tamaño de la pantalla |
| **Obtenido** | 35 px en 1080×2400. En una pantalla más corta, el botón queda debajo |
| **Severidad** | Media |

Medido, no estimado:

```
botón «LOGIN», borde inferior ....... y = 1359 px
ventana del teclado, borde superior . y = 1394 px   (alto: 1006 px)
                                      ───────────
margen .............................      35 px
```

**No se reprodujo como fallo en este dispositivo**, y eso es parte del hallazgo: el margen
existe, es de 35 píxeles, y basta una pantalla de 1080×2340 —que existe y es común— para
que desaparezca.

Esa es la forma de reportar un fallo que depende del dispositivo: no «a veces falla», sino
el número y el umbral a partir del cual falla. Lo primero no se puede arreglar; lo segundo
sí.

En la suite está mitigado cerrando el teclado tras escribir, y eso **no arregla nada para
la persona que usa la app**. La mitigación en las pruebas y el arreglo en el producto son
dos trabajos distintos, y confundirlos es cómo un defecto se queda tres años abierto con la
suite en verde.

---

## Qué hacer con esto

El orden que seguiría, y el motivo:

1. **MOV-05**, la única que es a la vez un problema de accesibilidad y la mayor fragilidad
   de la suite. Un atributo.
2. **MOV-01**, porque además de confundir a la persona obliga a la suite a reiniciar la app
   entre escenarios, que es tiempo en cada ejecución.
3. **MOV-09 y MOV-03**, las dos medias que se perciben como «la app está rota».
4. **MOV-04 y MOV-06**, de testabilidad: no los nota nadie usando la app, y abaratan cada
   escenario que se escriba de aquí en adelante.
5. **MOV-02, MOV-07 y MOV-08**, cuando toque tocar esa parte.

Y después de cada arreglo, el caso correspondiente de la
[matriz](03-matriz-trazabilidad.md) deja de estar en blanco. Ese es el momento de
automatizarlo: cuando comprobar que no vuelve tiene sentido.

---

Volver al [índice](README.md)
