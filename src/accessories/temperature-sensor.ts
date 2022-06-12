import axios from "axios"
import { AccessoryPlugin, HAP, Logging, Service } from "homebridge"
import { PullTimer } from "homebridge-http-base"

const PULL_INTERVAL = 5 * 60 * 1000 // 5 minutes

const parseResponse = (response: string) => {
  const ok = /otemp=\d{1,2}/.exec(response)
  if (ok) {
    return ok[0].split("=")[1]
  } else {
    return false
  }
}

export class TemperatureSensor implements AccessoryPlugin {
  private readonly log: Logging

  // This property must be existent!!
  name: string

  private readonly temperatureSensorService: Service
  private readonly informationService: Service
  private readonly pullTimer: PullTimer

  constructor(hap: HAP, log: Logging, name: string) {
    this.log = log
    this.name = name

    this.temperatureSensorService = new hap.Service.TemperatureSensor(name)

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, "Custom Manufacturer")
      .setCharacteristic(hap.Characteristic.Model, "Custom Model")

    this.temperatureSensorService
      .getCharacteristic(hap.Characteristic.CurrentTemperature)
      .onGet(this.onGetTemperature.bind(this))

    // refresh using pull timer
    this.pullTimer = new PullTimer(
      log,
      PULL_INTERVAL,
      this.onGetTemperature.bind(this),
      (value) => {
        this.temperatureSensorService.setCharacteristic(
          hap.Characteristic.CurrentTemperature,
          value
        )
      }
    )
    this.pullTimer.start()
  }

  async onGetTemperature() {
    const url = "http://192.168.8.106/aircon/get_sensor_info"
    const { data } = await axios.get<string>(url)
    return parseResponse(data)
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [this.informationService, this.temperatureSensorService]
  }
}
