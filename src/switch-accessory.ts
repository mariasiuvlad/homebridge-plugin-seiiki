import axios, { AxiosResponse } from "axios";
import {
  AccessoryPlugin,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service,
  CharacteristicEventTypes,
} from "homebridge";

export class ExampleSwitch implements AccessoryPlugin {
  private readonly log: Logging;

  private switchOn = false;

  // This property must be existent!!
  name: string;

  private readonly switchService: Service;
  private readonly informationService: Service;

  constructor(hap: HAP, log: Logging, name: string) {
    this.log = log;
    this.name = name;

    this.switchService = new hap.Service.Switch(name);
    this.switchService
      .getCharacteristic(hap.Characteristic.On)
      .on(
        CharacteristicEventTypes.GET,
        (callback: CharacteristicGetCallback) => {
          axios.get<{ state: number }>("http://192.168.0.105").then((value) => {
            const isOn = value.data.state === 1;
            log.info(
              "Current state of the switch was returned: " +
                (isOn ? "ON" : "OFF")
            );
            callback(undefined, isOn);
          });
        }
      )
      .on(
        CharacteristicEventTypes.SET,
        (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
          const boolValue = value as boolean;
          axios
            .get<{ state: number }>(
              `http://192.168.0.105/${boolValue ? "on" : "off"}`
            )
            .then((value) => {
              const isOn = value.data.state === 1;
              log.info(
                "Current state of the switch was returned: " +
                  (isOn ? "ON" : "OFF")
              );
              log.info("Switch state was set to: " + (isOn ? "ON" : "OFF"));
              // callback();
              // callback(undefined, isOn);
            });
        }
      );

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, "Custom Manufacturer")
      .setCharacteristic(hap.Characteristic.Model, "Custom Model");

    log.info("Example switch '%s' created!", name);
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify(): void {
    this.log("Identify!");
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [this.informationService, this.switchService];
  }
}
