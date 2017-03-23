"use strict";

var Hexiwear = function () {

    /* Defining UUIDs for services and characteristics */
    const DEVICE_INFORMATION_SERVICE = "0000180a-0000-1000-8000-00805f9b34fb";
    const MANUFACTURER_NAME = "00002A29-0000-1000-8000-00805f9b34fb";
    const HARDWARE_REVISION = "00002A25-0000-1000-8000-00805f9b34fb";
    const FIRMWARE_REVISION = "00002A26-0000-1000-8000-00805f9b34fb";
    const MOTION_SERVICE = "00002000-0000-1000-8000-00805f9b34fb";
    const ACCELEROMETER = "00002001-0000-1000-8000-00805f9b34fb";
    const GYRO = "00002002-0000-1000-8000-00805f9b34fb";
    const MAGNETOMETER = "00002003-0000-1000-8000-00805f9b34fb";
    const WEATHER_SERVICE = "00002010-0000-1000-8000-00805f9b34fb";
    const AMBIENT_LIGHT = "00002011-0000-1000-8000-00805f9b34fb";
    const TEMPERATURE = "00002012-0000-1000-8000-00805f9b34fb";
    const HUMIDITY = "00002013-0000-1000-8000-00805f9b34fb";
    const PRESSURE = "00002014-0000-1000-8000-00805f9b34fb";
    const HEALTH_SERVICE = "00002020-0000-1000-8000-00805f9b34fb";
    const HEART_RATE = "00002021-0000-1000-8000-00805f9b34fb";
    const STEPS = "00002022-0000-1000-8000-00805f9b34fb";
    const CALORIE = "00002023-0000-1000-8000-00805f9b34fb";
    const MODE_SERVICE = "00002040-0000-1000-8000-00805f9b34fb";
    const APP_MODE = "00002041-0000-1000-8000-00805f9b34fb";
    const BATT_SERVICE = "0000180f-0000-1000-8000-00805f9b34fb";
    const BATTERY = "00002a19-0000-1000-8000-00805f9b34fb";
    const APP_SERVICE = "00001800-0000-1000-8000-00805f9b34fb";
    const NAME = "00002A00-0000-1000-8000-00805f9b34fb";
    const DEVICE_NAME = 'HEXIWEAR';

    var self;

    function Hexiwear(bluetooth) {
        self = this;
        self.bluetooth = bluetooth;
        self.initialize();
    }

    /* Initializing properties for Hexiwear class */
    Hexiwear.prototype.initialize = function () {
        var self = this;
        self.bluetoothDevice = undefined;
        self.connected=false;
        self.server = undefined;
        self.motionService = undefined;
        self.weatherService = undefined;
        self.healthService = undefined;
        self.motionData = {acc:{}, gyro:{}, mag:{}};
        self.weatherData = {ambient_light: undefined, temperature: undefined, humidity:undefined, pressure: undefined};
        self.healthData = {heart_rate: undefined, steps: undefined, calorie: undefined};
        self.deviceInfoData = {manufacturerName: undefined, hardware: undefined, firmware:undefined, batteryData: undefined, modeData: undefined};
        self.disconnected = false;
        self.currentMode = undefined;
        self.paired = false;
    };

    /* Defining function for connecting to the device */
    Hexiwear.prototype.connect = function () {
        var options = {filters: [{name: DEVICE_NAME}]};
        return navigator.bluetooth.requestDevice(options)
        /* Connecting to the device */
            .then(function (device) {
                self.bluetoothDevice = device;
                return device.gatt.connect();
            })
            .then(function (server) {
                console.log("Discovering services");
                self.dismiss();
                self.server = server;
                self.onSuccess('Connected with ' + server.name);
                self.connected = true;
                /* Adding disconnection listener */
                self.bluetoothDevice.on("gattserverdisconnected", function (event) {
                    console.log("Device disconnected");
                    self.onError('Device disconnected');
                    self.disconnected = true;
                    self.disconnectIndicator();
                });

                /* Getting primary services */
                return Promise.all([
                    /* Getting device information data service */
                    server.getPrimaryService(DEVICE_INFORMATION_SERVICE)
                        .then(function (service) {
                            /* Function for reading device information characteristics */
                            self.readDeviceInfo(service);
                         }),
                    /* Getting battery data service */
                    server.getPrimaryService(BATT_SERVICE)
                        .then(function (service) {
                            /* Function for reading battery data characteristics */
                            self.readBattery(service);
                        }),
                    /* Getting motion data service */
                    server.getPrimaryService(MOTION_SERVICE)
                        .then(function (service) {
                            /* Function for reading motion data characteristics */
                            self.motionService = service;
                            self.readMotion(service);
                        }),
                    /* Getting weather data service */
                    server.getPrimaryService(WEATHER_SERVICE)
                        .then(function (service) {
                            /* Function for reading weather data characteristics */
                            self.weatherService = service;
                            self.readWeather(service);
                        }),
                    /* Getting health data service */
                    server.getPrimaryService(HEALTH_SERVICE)
                        .then(function (service) {
                            /* Function for reading health data characteristics */
                            self.healthService = service;
                            self.readHealth(service);
                        }),
                    /* Getting mode data service */
                    server.getPrimaryService(MODE_SERVICE)
                        .then(function (service) {
                            /* Function for reading mode data characteristics */
                            self.readMode(service);
                        })
                ]);
                /* Error handling function */
            }, function (error) {
                console.warn('Service not found'+error);
                Promise.resolve(true);
            })
    };

        /* ------- Hexiwear Handling Functions ------- */

    Hexiwear.prototype.readDeviceInfo = function (service) {
        Promise.all([
            /* Getting manufacturer name characteristic */
            service.getCharacteristic(MANUFACTURER_NAME)
                .then(function (characteristic) {
                    /* Read value from characteristic */
                    characteristic.readValue()
                        .then(function (value) {
                            /* Parsing characteristic readout */
                            self.deviceInfoData.manufacturerName = decode(value);
                            self.updateUI();
                        });
                }),
            /* Getting firmware version characteristic */
            service.getCharacteristic(FIRMWARE_REVISION)
                .then(function (characteristic) {
                    /* Read value from characteristic */
                    characteristic.readValue()
                        .then(function (value) {
                            /* Parsing characteristic readout */
                            self.deviceInfoData.firmware = decode(value);
                            self.updateUI();
                        });
                })
        ])
        /* Error handling function */
            .catch((error) => {
                console.log('Reading device info data failed. Error: ' + JSON.stringify(error));
            });
    };

    Hexiwear.prototype.readBattery = function (service) {
        /* Getting battery data characteristic */
        service.getCharacteristic(BATTERY)
            .then(function (characteristic) {
                /* Read value from characteristic */
                characteristic.readValue()
                    .then(function (value) {
                        /* Parsing characteristic readout */
                        self.deviceInfoData.batteryData = value.getUint8(0);
                        self.updateUI();
                        /* Adding listener for battery data changes */
                        return (characteristic.startNotifications())
                            .then(function () {
                                characteristic.addEventListener('characteristicvaluechanged', function (value) {
                                    self.deviceInfoData.batteryData = value.getUint8(0);
                                    self.updateUI();
                                });
                            });
                    });
            })
            /* Error handling function */
            .catch((error) => {
                console.log('Reading battery data failed. Error: ' + JSON.stringify(error));
            });
    };

    Hexiwear.prototype.readMotion = function (service) {
        Promise.all([
            /* Getting accelerometer data characteristic */
            service.getCharacteristic(ACCELEROMETER)
                .then(function (characteristic) {
                    /* Read value from characteristic */
                    characteristic.readValue()
                        .then(function (value) {
                            /* Parsing characteristic readout */
                            self.paired = true;
                            self.motionData.acc.x = value.getInt16(0, true) / 100;
                            self.motionData.acc.y = value.getInt16(2, true) / 100;
                            self.motionData.acc.z = value.getInt16(4, true) / 100;
                            self.updateUI();
                        })
                }),
            /* Getting gyroscope data characteristic */
            service.getCharacteristic(GYRO)
                .then(function (characteristic) {
                    /* Read value from characteristic */
                    characteristic.readValue()
                        .then(function (value) {
                            /* Parsing characteristic readout */
                            self.paired = true;
                            self.motionData.gyro.x = value.getInt16(0, true) / 100;
                            self.motionData.gyro.y = value.getInt16(2, true) / 100;
                            self.motionData.gyro.z = value.getInt16(4, true) / 100;
                            self.updateUI();
                        });
                }),
            /* Getting magnetometer data characteristic */
            service.getCharacteristic(MAGNETOMETER)
                .then(function (characteristic) {
                    /* Read value from characteristic */
                    characteristic.readValue()
                        .then(function (value) {
                            /* Parsing characteristic readout */
                            self.paired = true;
                            self.motionData.mag.x = value.getInt16(0, true) / 100;
                            self.motionData.mag.y = value.getInt16(2, true) / 100;
                            self.motionData.mag.z = value.getInt16(4, true) / 100;
                            self.updateUI();
                        });
                })
        ])
        /* Error handling function */
            .catch((error) => {
                console.log('Reading motion data failed. Error: '+JSON.stringify(error));
            });
    };

    Hexiwear.prototype.readWeather = function (service) {
        Promise.all([
            /* Getting ambient light data characteristic */
            service.getCharacteristic(AMBIENT_LIGHT)
                .then(function (characteristic) {
                    /* Read value from characteristic */
                    characteristic.readValue()
                        .then(function (value) {
                            /* Parsing characteristic readout */
                            self.weatherData.ambient_light = value.getUint8(0);
                            self.updateUI();
                        });
                }),
            /* Getting temperature data characteristic */
            service.getCharacteristic(TEMPERATURE)
                .then(function (characteristic) {
                    /* Read value from characteristic */
                    characteristic.readValue()
                        .then(function (value) {
                            /* Parsing characteristic readout */
                            self.weatherData.temperature = value.getInt16(0) / 100;
                            self.updateUI();
                        });
                }),
            /* Getting humidity data characteristic */
            service.getCharacteristic(HUMIDITY)
                .then(function (characteristic) {
                    /* Read value from characteristic */
                    characteristic.readValue()
                        .then(function (value) {
                            /* Parsing characteristic readout */
                            self.weatherData.humidity = value.getInt16(0) / 100;
                            self.updateUI();
                        });
                }),
            /* Getting pressure data characteristic */
            service.getCharacteristic(PRESSURE)
                .then(function (characteristic) {
                    /* Read value from characteristic */
                    characteristic.readValue()
                        .then(function (value) {
                            /* Parsing characteristic readout */
                            self.weatherData.pressure = value.getInt16(0) / 100;
                            self.updateUI();
                        });
                })
        ])
        /* Error handling function */
            .catch((error) => {
                console.log('Reading weather data failed. Error: '+JSON.stringify(error));
            });
    };

    Hexiwear.prototype.readHealth = function (service) {
        Promise.all([
            /* Getting heart rate data characteristic */
            service.getCharacteristic(HEART_RATE)
                .then(function (characteristic) {
                    /* Read value from characteristic */
                    characteristic.readValue()
                        .then(function (value) {
                            /* Parsing characteristic readout */
                            self.healthData.heart_rate = value.getUint8(0);
                            self.updateUI();
                        });
                }),
            /* Getting steps data characteristic */
            service.getCharacteristic(STEPS)
                .then(function (characteristic) {
                    /* Read value from characteristic */
                    characteristic.readValue()
                        .then(function (value) {
                            /* Parsing characteristic readout */
                            self.healthData.steps = value.getUint16(0);
                            self.updateUI();
                        });
                }),
            /* Getting calorie data characteristic */
            service.getCharacteristic(CALORIE)
                .then(function (characteristic) {
                    /* Read value from characteristic */
                    characteristic.readValue()
                        .then(function (value) {
                            /* Parsing characteristic readout */
                            self.healthData.calorie = value.getUint16(0);
                            self.updateUI();
                        });
                })
        ])
        /* Error handling function */
            .catch((error) => {
                console.log('Reading health data failed. Error: '+JSON.stringify(error));
            });
    };

    Hexiwear.prototype.readMode = function (service) {
        /* Getting application mode data characteristic */
        service.getCharacteristic(APP_MODE)
            .then(function (characteristic) {
                /* Read value from characteristic */
                characteristic.readValue()
                    .then(function (value) {
                        /* Parsing characteristic readout */
                        updateModeData(value.getUint8(0));
                        self.updateUI();
                        /* Adding listener for application mode data changes */
                        return characteristic.startNotifications()
                            .then(function () {
                                characteristic.addEventListener('characteristicvaluechanged', function (value) {
                                    self.updateUI();
                                    updateModeData(value.getUint8(0));
                                });
                            });
                    });
            })
            /* Error handling function */
            .catch((error) => {
                console.log('Reading application mode failed. Error: ' + JSON.stringify(error));
            });
    };

    /* Refresh function for updating data */
    Hexiwear.prototype.refreshValues = function() {
        if (self.motionService){
            self.readMotion(self.motionService);
        }
        if (self.weatherService){
            self.readWeather(self.weatherService);
        }
        if (self.healthService){
            self.readHealth(self.healthService);
        }
    };

    window.hexiwear = new Hexiwear();
}();

/* Helper function for storing current mode data */
var updateModeData = (value) => {
    hexiwear.deviceInfoData.modeData = value;
    switch (value){
        case 0:
            hexiwear.currentMode = 'None';
            break;
        case 2:
            hexiwear.currentMode = 'Sensor Tag';
            break;
        case 5:
            hexiwear.currentMode = 'Heart Rate';
            break;
        case 6:
            hexiwear.currentMode = 'Pedometer';
            break;
    }
};

/* Helper function for decoding string */
var decode = function (value) {
    var decoder = new TextDecoder();
    var result = decoder.decode(value);
    return result.replace(/\0/g, '');
};
