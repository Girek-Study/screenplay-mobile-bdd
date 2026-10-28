/**
 * El driver de la sesión en curso.
 *
 * El equivalente móvil de la página en web: Cucumber no pasa contexto entre
 * hooks y steps, así que vive aquí y el Actor lo lee.
 */
export const driverFixture: { driver?: WebdriverIO.Browser } = { driver: undefined };
