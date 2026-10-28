// Los steps se importan de @wdio/cucumber-framework, NO de @cucumber/cucumber.
//
// WebdriverIO arranca su propia instancia de Cucumber dentro del worker.
// Importar de @cucumber/cucumber registra los pasos en una segunda instancia
// que nunca corre, y la suite muere con «You're calling functions on an
// instance of Cucumber that isn't running (status: PENDING)» antes de tocar el
// dispositivo. El mensaje habla de instalación corrupta y no lo es.
import { Given, When, Then } from '@wdio/cucumber-framework';
import { Actor } from '../../0003.Actors/Actor';
import { AbrirPestana } from '../../0007.Tasks/General/T000.Abrir.Pestana';
import { IniciarSesion } from '../../0007.Tasks/Sesion/T001.Iniciar.Sesion';
import { Registrarse } from '../../0007.Tasks/Sesion/T002.Registrarse';
import { CerrarDialogo } from '../../0007.Tasks/Sesion/T003.Cerrar.Dialogo';
import { Deslizar } from '../../0004.Interactions/I004.Deslizar';
import { EsVisible } from '../../0008.Questions/Q001.Es.Visible';
import { VerTexto } from '../../0008.Questions/Q003.Ver.Texto';
import { Navegacion } from '../../0005.Interfaces/Compartidas/Navegacion';
import { PantallaSesion } from '../../0005.Interfaces/Compartidas/Pantalla.Sesion';
import { credenciales } from '../../0006.Models/Credenciales';

/**
 * Un solo archivo de steps para Android e iOS.
 *
 * El Gherkin habla de lo que hace la persona, y eso no cambia de sistema
 * operativo. La diferencia vive dos capas más abajo, en los selectores.
 */

let ana: Actor;

Given('(que ){word} abre la pestaña de sesión', async function (nombre: string) {
  ana = new Actor(nombre);
  await ana.attemptsTo(
    AbrirPestana.la(Navegacion.pestanaSesion, PantallaSesion.campoCorreo, 'Sesión'),
  );
});

Given('(que )abre la pestaña de deslizamiento', async function () {
  await ana.attemptsTo(
    AbrirPestana.la(Navegacion.pestanaDeslizar, Navegacion.pestanaDeslizar, 'Deslizar'),
  );
});

Given('(que )ingresa como {string}', async function (perfil: string) {
  await ana.attemptsTo(IniciarSesion.con(credenciales(perfil)));
});

When('se registra como {string}', async function (perfil: string) {
  await ana.attemptsTo(Registrarse.con(credenciales(perfil)));
});

When('cierra el diálogo', async function () {
  await ana.attemptsTo(CerrarDialogo.ahora());
});

When('desliza hacia la {string}', async function (direccion: string) {
  await ana.attemptsTo(Deslizar.hacia(direccion as 'izquierda' | 'derecha'));
});

Then('ve el diálogo {string}', async function (titulo: string) {
  await ana.attemptsTo(VerTexto.el(titulo).en(PantallaSesion.tituloDialogo, 'título del diálogo'));
});

Then('el diálogo dice {string}', async function (mensaje: string) {
  await ana.attemptsTo(VerTexto.el(mensaje).en(PantallaSesion.mensajeDialogo, 'mensaje del diálogo'));
});

Then('ve el campo de correo', async function () {
  await ana.attemptsTo(EsVisible.el(PantallaSesion.campoCorreo, 'campo de correo'));
});

Then('sigue viendo la pantalla de deslizamiento', async function () {
  await ana.attemptsTo(EsVisible.el(Navegacion.pestanaDeslizar, 'pantalla de deslizamiento'));
});
