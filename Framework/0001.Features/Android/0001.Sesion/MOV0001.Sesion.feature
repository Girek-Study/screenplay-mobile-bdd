# language: es
@movil @sesion
Característica: Ingreso y registro en la aplicación
  Como persona con la app instalada
  quiero entrar con mi correo y mi clave
  para usar mi cuenta

  Antecedentes:
    Dado que Ana abre la pestaña de sesión

  @smoke @regresion
  Escenario: Ingreso con credenciales válidas
    Cuando ingresa como "valido"
    Entonces ve el diálogo "Success"
    Y el diálogo dice "You are logged in!"

  @regresion
  Escenario: Cerrar el diálogo devuelve el formulario
    Dado que ingresa como "valido"
    Cuando cierra el diálogo
    Entonces ve el campo de correo

  @smoke @regresion
  Escenario: Registro de una cuenta nueva
    Cuando se registra como "valido"
    Entonces ve el diálogo "Signed Up!"

  @regresion
  Escenario: Deslizar la pantalla de inicio
    Dado que abre la pestaña de deslizamiento
    Cuando desliza hacia la "izquierda"
    Entonces sigue viendo la pantalla de deslizamiento
