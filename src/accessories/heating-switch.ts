import axios, { AxiosResponse } from "axios"
import { AccessoryPlugin, HAP, Logging, Service, CharacteristicEventTypes } from "homebridge"

/** @todo extract to lib */
type HeatingApiResponse = { state: number; success: boolean }

/** @todo extract to lib */
interface HeatingApi {
  on: () => Promise<AxiosResponse<HeatingApiResponse>>
  off: () => Promise<AxiosResponse<HeatingApiResponse>>
  status: () => Promise<AxiosResponse<HeatingApiResponse>>
}

/** @todo extract to lib */
const heatingApi = (uri: string): HeatingApi => ({
  on: () => axios.get<HeatingApiResponse>(`${uri}/on`),
  off: () => axios.get<HeatingApiResponse>(`${uri}/off`),
  status: () => axios.get<HeatingApiResponse>(uri),
})

export class HeatingSwitch implements AccessoryPlugin {
  private readonly log: Logging

  // This property must be existent!!
  name: string

  heatingApi: HeatingApi

  private readonly switchService: Service
  private readonly informationService: Service

  constructor(hap: HAP, log: Logging, name: string) {
    this.log = log
    this.name = name
    this.heatingApi = heatingApi("http://192.168.8.200")

    this.switchService = new hap.Service.Switch(name)
    this.switchService
      .getCharacteristic(hap.Characteristic.On)
      .on(CharacteristicEventTypes.GET, async (callback) => {
        try {
          const {
            data: { state },
          } = await this.heatingApi.status()
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
          const apiCall = boolValue ? this.heatingApi.on : this.heatingApi.off
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
