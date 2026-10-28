import { base, rutaApp } from './wdio.mobile.base.conf';
import { MOVIL } from './Framework/0009.Utils/Config/Mobile.Config';

export const config: WebdriverIO.Config = {
  ...base,

  capabilities: [
    {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': MOVIL.dispositivo ?? 'iPhone 15',
      ...(MOVIL.ios.udid ? { 'appium:udid': MOVIL.ios.udid } : {}),
      ...(MOVIL.versionPlataforma ? { 'appium:platformVersion': MOVIL.versionPlataforma } : {}),

      ...(MOVIL.ios.bundleId ? { 'appium:bundleId': MOVIL.ios.bundleId } : {}),
      ...(rutaApp(MOVIL.ios.app) ? { 'appium:app': rutaApp(MOVIL.ios.app) } : {}),

      'appium:newCommandTimeout': 240,
      'appium:noReset': false,
    },
  ],
};
