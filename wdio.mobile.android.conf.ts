import { base, rutaApp } from './wdio.mobile.base.conf';
import { MOVIL } from './Framework/0009.Utils/Config/Mobile.Config';

export const config: WebdriverIO.Config = {
  ...base,

  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': MOVIL.dispositivo ?? 'Android',
      ...(MOVIL.android.udid ? { 'appium:udid': MOVIL.android.udid } : {}),
      ...(MOVIL.versionPlataforma ? { 'appium:platformVersion': MOVIL.versionPlataforma } : {}),

      'appium:appPackage': MOVIL.android.appPackage,
      'appium:appActivity': MOVIL.android.appActivity,
      ...(rutaApp(MOVIL.android.app) ? { 'appium:app': rutaApp(MOVIL.android.app) } : {}),

      // Sin esto, el primer arranque de la sesión se come el diálogo de permisos
      // y el escenario falla sin haber tocado la aplicación.
      'appium:autoGrantPermissions': true,
      'appium:newCommandTimeout': 240,
      'appium:noReset': false,
    },
  ],
};
