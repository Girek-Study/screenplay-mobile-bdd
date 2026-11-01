# 1. Análisis funcional

Antes de diseñar un caso hay que saber qué hace la aplicación. No lo que dice la tienda:
lo que hace en el dispositivo.

Esto se escribió **usando la app en un emulador Android API 36**, volcando el árbol de
vistas con `uiautomator` en cada paso. No leyendo su código: la app de ejemplo es de
WebdriverIO y aquí se trata como una caja negra, que es la situación normal de quien
automatiza un móvil ajeno.

---

## Qué es

La [native-demo-app de WebdriverIO](https://github.com/webdriverio/native-demo-app):
una app React Native con siete pestañas, pensada para practicar automatización. Las que
usa esta suite son dos.

```
┌─────────────────────────────────────────────┐
│  Home   Web   Login   Forms   Swipe   Drag  │  ← barra inferior, siempre visible
└─────────────────────────────────────────────┘
                   │
         ┌─────────┴──────────┐
         │   Login / Sign up  │   dos sub-pestañas, un solo formulario
         └────────────────────┘
                   │  credenciales válidas
                   ▼
         ┌────────────────────┐
         │ Diálogo «Success»  │   modal; tapa la barra inferior
         └────────────────────┘
```

Sin servidor y sin cuentas: **acepta cualquier correo bien formado**. No valida contra
nada, solo contra el formato.

---

## Reglas, una por una

Todas comprobadas en el dispositivo. La última columna es la que importa: **ninguna está
escrita en ningún sitio** y todas cambian lo que una persona percibe.

### Ingreso

| # | Regla | Comprobado |
| --- | --- | --- |
| R1 | Entra con cualquier correo de formato válido y clave de 8 caracteres o más | `girek@girek-study.com` + 8 caracteres → diálogo «Success» |
| R2 | Clave de menos de 8 caracteres → «Please enter at least 8 characters» | 7 caracteres → rechazado; 8 → aceptado |
| R3 | Correo sin arroba, con espacios, o con TLD de un carácter → «Please enter a valid email address» | `a@b.c` rechazado; `a@b.co` aceptado |
| R4 | El correo **no distingue mayúsculas**: `A@B.CO` entra | Comprobado |
| R5 | Con los dos campos vacíos salen **los dos** errores a la vez | Comprobado |
| R6 | El error se recalcula **al enviar**, no al escribir | Con un correo válido escrito, el error anterior sigue en pantalla |
| R7 | El diálogo de éxito es modal y **bloquea la barra inferior** | Con el diálogo abierto, pulsar «Forms» no hace nada |

### Registro

| # | Regla | Comprobado |
| --- | --- | --- |
| R8 | Mismas reglas de correo y clave, más un tercer campo de confirmación | Comprobado |
| R9 | Claves distintas → «Please enter the same password» | `Clave.99` vs `OtraClave.99` → rechazado |
| R10 | Cambiar de sub-pestaña **conserva** lo escrito en los campos comunes | Comprobado |

### Lo transversal

| # | Regla | Comprobado |
| --- | --- | --- |
| R11 | La app está **anclada en vertical**: ignora la rotación del sistema | `user_rotation=1` y la pantalla sigue en `ROTATION_0` |
| R12 | Salir de la pestaña y volver **no reinicia el formulario**: conserva campos y errores | Home → Login deja el error anterior a la vista |
| R13 | La clave se enmascara con un punto por carácter, y esa longitud es legible en el árbol de accesibilidad | Clave de 12 → `••••••••••••` |

---

## Las cuatro cosas que el árbol de vistas dice y nadie mira

Aquí es donde el análisis de una app móvil se separa del de una web. Lo que sigue no sale
de usar la aplicación: sale de volcar su jerarquía y leerla.

**1. Tres campos distintos comparten el mismo `resource-id`.**

```
EditText  desc=input-email            id=RNE__Input__text-input
EditText  desc=input-password         id=RNE__Input__text-input
EditText  desc=input-repeat-password  id=RNE__Input__text-input
```

Es el id que React Native Elements pone a todos sus inputs. Un selector por id encuentra
tres elementos. Lo único que distingue los campos es el `content-desc`, y por eso **toda la
capa de interfaces de esta suite usa accessibility id** (`~input-email`) y no ids.

**2. Los mensajes de error no tienen identificador ni descripción.**

```xml
<node text="Please enter a valid email address"
      resource-id="" content-desc="" focusable="false" ... />
```

Sin `resource-id`, sin `content-desc` y no enfocable. **La única forma de localizarlos desde
una prueba es su texto literal en inglés.** El día que la app se traduzca, cualquier
aserción sobre un error se cae, y se cae por una razón que no tiene nada que ver con el
defecto que buscaba.

**3. El diálogo mezcla dos familias de identificadores.**

| Parte | Identificador | Quién lo pone |
| --- | --- | --- |
| Título | `com.wdiodemoapp:id/alert_title` | AppCompat, la librería de la app |
| Mensaje | `android:id/message` | La plataforma |
| Botón «OK» | `android:id/button1` | La plataforma |

Parece un diálogo del sistema y lo es a medias. Una estrategia de selectores que asuma
«todo es `android:id/…`» funciona para el mensaje y falla para el título, que es justo el
elemento por el que uno empieza. Es el motivo del `contains(@resource-id, "alert_title")`
que hay en la capa 5.

Y la prueba de que la distinción es real: en este mismo emulador, **un diálogo de verdad
del sistema** —el «Bluetooth keeps stopping» que apareció al arrancar— sí usa
`android:id/alertTitle`. Los dos existen y no son el mismo.

**4. Un accessibility id con un espacio dentro.**

```
ViewGroup  desc=button-SIGN UP
```

`button-SIGN UP`, con espacio. Funciona, pero convierte el selector en algo que no se puede
pasar por línea de comandos sin entrecomillar y que algunas herramientas parten en dos.

---

## Lo que la aplicación no hace

Tan importante como lo anterior, porque delimita qué **no** tiene sentido probar:

- **No rota.** Está anclada en vertical. Un caso de «girar el dispositivo y comprobar que
  el formulario sobrevive» prueba una transición que no existe.
- **No persiste la sesión.** Cerrar y reabrir la app devuelve el formulario vacío.
- **No tiene servidor.** No hay errores de red, ni tiempos de espera, ni códigos de estado.
- **No tiene cuentas.** Cualquier correo bien formado entra. No hay «usuario ya registrado»,
  ni recuperación de clave, ni roles.
- **No pide permisos.** Ni cámara, ni ubicación, ni notificaciones. El diálogo de permisos
  de Android, que es la primera trampa de casi cualquier suite móvil real, aquí no aparece.

Ese último punto conviene decirlo en voz alta: **esta suite no demuestra el manejo de
permisos porque la app no los pide.** Fingir que sí sería más fácil que admitirlo.

---

## Preguntas que un análisis honesto deja abiertas

1. **¿Los 8 caracteres de clave son una regla de negocio o el valor por defecto de una
   librería?** El mensaje es el de `yup`/`formik` sin traducir, lo que sugiere lo segundo.
   Cambia el caso: un valor por defecto se mueve sin avisar.
2. **¿El correo debe distinguir mayúsculas?** Hoy no lo hace. Es lo correcto según el
   estándar para el dominio y discutible para la parte local.
3. **¿`a@b.co` debe entrar?** Es formato válido y dominio inexistente. La app solo mira el
   formato, que para una demo está bien y para un registro real no.

En un producto real estas tres se preguntan antes de escribir un caso. Aquí quedan
anotadas como supuestos, y cada supuesto se marca como tal en el
[diseño de casos](02-diseno-de-casos.md).

---

Siguiente: [2. Diseño de casos](02-diseno-de-casos.md)
