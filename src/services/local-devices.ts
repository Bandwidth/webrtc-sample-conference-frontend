import BandwidthRtc from "@bandwidth/webrtc-browser";
const bandwidthRtc = new BandwidthRtc("debug");

/**
 * Stores information about the user's base device preferences
 */
interface DevicePreference {
    audioDevice: MediaDeviceInfo;
    videoDevice: MediaDeviceInfo;
}

/**
 * Pulls default media, and if the user hasn't granted access this call will throw an exception.
 */
async function checkWebRTC() {
    // always check real quick that we have access
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    } catch (err) {
      console.log(`failed to get webrtc access`);
      console.log(err);
      throw err;
    }
}

const getLocalDevices = async (): Promise<{[key: string]: {[key: string]: MediaDeviceInfo}}> => {
    await checkWebRTC();
    const cams = await bandwidthRtc.getVideoInputs();
    const mics = await bandwidthRtc.getAudioInputs();

    const vDevices: {[key: string]: MediaDeviceInfo} = {};
    cams.forEach((device: MediaDeviceInfo) => {
      vDevices[device.deviceId] = device;
    })

    const aDevices: {[key: string]: MediaDeviceInfo} = {};
    mics.forEach((device: MediaDeviceInfo) => {
      aDevices[device.deviceId] = device;
    })
    return {
      audioDevices: aDevices,
      videoDevices: vDevices
    }
}

const setAudioAndVideoDevice = (audioDevice: MediaDeviceInfo | undefined, videoDevice: MediaDeviceInfo | undefined) => {
  if (!audioDevice || !videoDevice) {
    localStorage.removeItem('mediaDevicePreference');
    return;
  }
  const devicePreference: DevicePreference = {
    audioDevice: audioDevice,
    videoDevice: videoDevice
  };
  localStorage.setItem('mediaDevicePreference', JSON.stringify(devicePreference));
}

const getAudioAndVideoDevice = async () => {
  const mediaDevicePreference = localStorage.getItem('mediaDevicePreference');
  if (!mediaDevicePreference) {
    return {
      video: true,
      audio: true
    };
  } else {
    const mediaDevicePreferenceJson: DevicePreference = JSON.parse(mediaDevicePreference);
    const localDevices: {[key: string]: {[key: string]: MediaDeviceInfo}} = await getLocalDevices();
    const audioDevice = Object.values(localDevices.audioDevices).find((item) => {return item.deviceId === mediaDevicePreferenceJson.audioDevice.deviceId})
    const videoDevice = Object.values(localDevices.videoDevices).find((item) => {return item.deviceId === mediaDevicePreferenceJson.videoDevice.deviceId})
    return {
      video: videoDevice ? {deviceId: videoDevice.deviceId} : true,
      audio: audioDevice ? {deviceId: audioDevice.deviceId} : true
    };
  }
}

const getDevicePreference = () => {
  const mediaDevicePreference = localStorage.getItem('mediaDevicePreference');
  if (!mediaDevicePreference) {
    return {
      audioDevice: null,
      videoDevice: null
    };
  } else {
    return JSON.parse(mediaDevicePreference);
  }
}

export { getLocalDevices, setAudioAndVideoDevice, getAudioAndVideoDevice, getDevicePreference };
