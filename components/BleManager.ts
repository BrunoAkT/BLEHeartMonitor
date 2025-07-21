import { BleManager } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';

const manager = new BleManager();

export const requestPermissions = async () => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);

            const allGranted = Object.values(granted).every(value => value === PermissionsAndroid.RESULTS.GRANTED);

            if (!allGranted) {
                console.warn('Permissões necessárias não concedidas');
            }
        } catch (err) {
            console.warn('Erro ao solicitar permissões', err);
        }
    }
};

export async function startScan(onDeviceFound: (device: any) => void) {
    await requestPermissions();
    console.log('Escaneando dispositivos...');
    let deviceFound = false;


    manager.startDeviceScan(null, null, (error, device) => {

        if (error) {
            console.warn('Erro ao escanear:', error);
            return;
        }

        if (device?.name?.includes('Mi Band') || device?.name?.includes('Smart')) {
            console.log('Dispositivo encontrado:', device.name);
            deviceFound = true;
            onDeviceFound(device);
            manager.stopDeviceScan();
        }
    });

    setTimeout(() => {
        if (!deviceFound) {
            console.log('Nenhum dispositivo encontrado');
            manager.stopDeviceScan();
        }
    }, 10000)
}

export async function connectAndRead(device: { id: string; }) {
    const connectedDevice = await manager.connectToDevice(device.id);
    await connectedDevice.discoverAllServicesAndCharacteristics();

    const services = await connectedDevice.services();

    for (const service of services) {
        const characteristics = await service.characteristics();
        for (const char of characteristics) {
            // UUIDs comuns de frequência cardíaca
            if (char.uuid.includes('2a37')) {
                char.monitor((err, char) => {
                    if (err) return;
                    const raw = char?.value;
                    if (raw) {
                        const decoded = Buffer.from(raw, 'base64');
                        const bpm = decoded[1]; // Byte 1 = BPM
                        console.log('Frequência cardíaca:', bpm);
                    }
                });
            }
        }
    }
}
