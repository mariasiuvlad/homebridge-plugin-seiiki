import axios from "axios"
import { AccessoryPlugin, HAP, Logging, Service, CharacteristicEventTypes } from "homebridge"

const heatingApi = {
  on: () => axios.get<{ state: number }>("http://192.168.8.200/on"),
  off: () => axios.get<{ state: number }>("http://192.168.8.200/off"),
  status: () => axios.get<{ state: number }>("http://192.168.8.200"),
}

export class HeatingSwitch implements AccessoryPlugin {
  private readonly log: Logging

  // This property must be existent!!
  name: string

  private readonly switchService: Service
  private readonly informationService: Service

  constructor(hap: HAP, log: Logging, name: string) {
    this.log = log
    this.name = name

    this.switchService = new hap.Service.Switch(name)
    this.switchService
      .getCharacteristic(hap.Characteristic.On)
      .on(CharacteristicEventTypes.GET, async (callback) => {
        try {
          const {
            data: { state },
          } = await heatingApi.status()
          const isOn = state === 1
          log.info("Current state of the switch was returned: " + (isOn ? "ON" : "OFF"))
          callback(undefined, isOn)
        } catch (error) {
          callback(undefined, false)
        }
      })
      .on(CharacteristicEventTypes.SET, async (value, callback) => {
        try {
          const boolValue = value as boolean
          const apiCall = boolValue ? heatingApi.on : heatingApi.off
          const {
            data: { state },
          } = await apiCall()
          const isOn = state === 1
          log.info("Switch state was set to: " + (boolValue ? "ON" : "OFF"))
          log.info("Current state of the switch was returned: " + (isOn ? "ON" : "OFF"))
          callback(undefined, isOn)
        } catch (error) {
          callback(undefined, false)
        }
      })

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, "Custom Manufacturer")
      .setCharacteristic(hap.Characteristic.Model, "Custom Model")

    log.info("Example switch '%s' created!", name)
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify(): void {
    this.log("Identify!")
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [this.informationService, this.switchService]
  }
}
