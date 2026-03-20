import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { ConnectionSession } from './handshake';
import { PayloadV1 } from '@/types/exchange';

// Custom service UUID for our app
const SERVICE_UUID = '00000000-0000-1000-8000-00805f9b34fb';
const SESSION_CHARACTERISTIC_UUID = '00000001-0000-1000-8000-00805f9b34fb';
const PAYLOAD_CHARACTERISTIC_UUID = '00000002-0000-1000-8000-00805f9b34fb';

export class BluetoothConnection {
  private manager: BleManager;
  private device: Device | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  /**
   * Initialize BLE and check if supported
   */
  async initialize(): Promise<boolean> {
    try {
      const state = await this.manager.state();
      return state === 'PoweredOn';
    } catch (error) {
      console.error('BLE initialization failed:', error);
      return false;
    }
  }

  /**
   * Advertise as peripheral with session ID (initiator device)
   */
  async advertiseSession(session: ConnectionSession): Promise<void> {
    try {
      // Start advertising with the session ID in the local name
      // Note: Actual peripheral mode requires native module implementation
      // This is a simplified version - you'd need to implement peripheral mode
      console.log('Advertising session:', session.sessionId);

      // In a full implementation, you'd:
      // 1. Create a GATT server
      // 2. Add service with characteristics
      // 3. Start advertising
    } catch (error) {
      console.error('Failed to advertise:', error);
      throw error;
    }
  }

  /**
   * Scan for device advertising the session ID (responder device)
   */
  async connectToSession(remoteSession: ConnectionSession, timeout: number = 10000): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.manager.stopDeviceScan();
        reject(new Error('Connection timeout'));
      }, timeout);

      this.manager.startDeviceScan(
        null,
        null,
        async (error, device) => {
          if (error) {
            clearTimeout(timeoutId);
            this.manager.stopDeviceScan();
            reject(error);
            return;
          }

          // Check if this device is advertising our session
          if (device?.name?.includes(remoteSession.sessionId.substring(0, 8))) {
            clearTimeout(timeoutId);
            this.manager.stopDeviceScan();

            try {
              // Connect to the device
              this.device = await device.connect();
              await this.device.discoverAllServicesAndCharacteristics();
              resolve(true);
            } catch (connectError) {
              reject(connectError);
            }
          }
        }
      );
    });
  }

  /**
   * Send payload over BLE connection
   */
  async sendPayload(payload: PayloadV1): Promise<boolean> {
    if (!this.device) {
      throw new Error('No device connected');
    }

    try {
      const payloadString = JSON.stringify(payload);
      const base64Payload = Buffer.from(payloadString).toString('base64');

      // Split into chunks if needed (BLE has 512 byte limit per write)
      const chunkSize = 512;
      const chunks: string[] = [];

      for (let i = 0; i < base64Payload.length; i += chunkSize) {
        chunks.push(base64Payload.substring(i, i + chunkSize));
      }

      // Send each chunk
      for (const chunk of chunks) {
        await this.device.writeCharacteristicWithResponseForService(
          SERVICE_UUID,
          PAYLOAD_CHARACTERISTIC_UUID,
          Buffer.from(chunk).toString('base64')
        );
      }

      return true;
    } catch (error) {
      console.error('Failed to send payload:', error);
      return false;
    }
  }

  /**
   * Receive payload over BLE connection
   */
  async receivePayload(): Promise<PayloadV1 | null> {
    if (!this.device) {
      throw new Error('No device connected');
    }

    try {
      // Monitor characteristic for incoming data
      return new Promise((resolve, reject) => {
        let receivedData = '';

        this.device!.monitorCharacteristicForService(
          SERVICE_UUID,
          PAYLOAD_CHARACTERISTIC_UUID,
          (error, characteristic) => {
            if (error) {
              reject(error);
              return;
            }

            if (characteristic?.value) {
              const chunk = Buffer.from(characteristic.value, 'base64').toString();
              receivedData += chunk;

              // Check if we received the complete payload (implement your own end marker)
              try {
                const decoded = Buffer.from(receivedData, 'base64').toString();
                const payload: PayloadV1 = JSON.parse(decoded);
                resolve(payload);
              } catch {
                // Not complete yet, keep receiving
              }
            }
          }
        );
      });
    } catch (error) {
      console.error('Failed to receive payload:', error);
      return null;
    }
  }

  /**
   * Bidirectional exchange: send and receive simultaneously
   */
  async exchangePayloads(localPayload: PayloadV1): Promise<PayloadV1 | null> {
    try {
      // Start receiving first
      const receivePromise = this.receivePayload();

      // Then send our payload
      await this.sendPayload(localPayload);

      // Wait for their payload
      return await receivePromise;
    } catch (error) {
      console.error('Failed to exchange payloads:', error);
      return null;
    }
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    try {
      if (this.device) {
        await this.device.cancelConnection();
        this.device = null;
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }

  /**
   * Cleanup BLE manager
   */
  async cleanup(): Promise<void> {
    try {
      await this.disconnect();
      this.manager.destroy();
    } catch (error) {
      console.error('BLE cleanup failed:', error);
    }
  }
}
