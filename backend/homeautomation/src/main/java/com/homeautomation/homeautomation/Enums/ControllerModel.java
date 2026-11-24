
package com.homeautomation.homeautomation.Enums;

public enum ControllerModel {

    ESP32_8_CHANNEL(8);

    private final int totalPorts;

    ControllerModel(int totalPorts) {
        this.totalPorts = totalPorts;
    }

    public int getTotalPorts() {
        return totalPorts;
    }
}
