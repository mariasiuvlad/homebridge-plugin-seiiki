import {
  AccessoryPlugin,
  API,
  HAP,
  Logging,
  PlatformConfig,
  StaticPlatformPlugin,
} from "homebridge"
import { HeatingSwitch } from "./accessories"
import { TemperatureSensor } from "./accessories/temperature-sensor"
import { PLATFORM_NAME } from "./settings"

let hap: HAP

export = (api: API) => {
  hap = api.hap
  api.registerPlatform(PLATFORM_NAME, SeiikiPlatform)
}

class SeiikiPlatform implements StaticPlatformPlugin {
  private readonly log: Logging

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(log: Logging, _config: PlatformConfig, _api: API) {
    this.log = log

    // probably parse config or something here

    log.info("Example platform finished initializing!")
  }

  /*
   * This method is called to retrieve all accessories exposed by the platform.
   * The Platform can delay the response my invoking the callback at a later time,
   * it will delay the bridge startup though, so keep it to a minimum.
   * The set of exposed accessories CANNOT change over the lifetime of the plugin!
   */
  accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {
    callback([
      new HeatingSwitch(hap, this.log, "Heating"),
      new TemperatureSensor(hap, this.log, "Temperature Sensor"),
    ])
  }
}
