import React, {useState, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Select from '@material-ui/core/Select';

import { getLocalDevices } from './services/local-devices';

interface SettingsProps {
    show: boolean,
    onSubmit: { (selectedVideoDevice: MediaDeviceInfo | undefined, selectedAudioDevice: MediaDeviceInfo | undefined): void };
}

const Settings: React.FC<SettingsProps> = (props) => {

    const [selectedCamera, setSelectedCamera] = useState<string>('Disabled');
    const [selectedMic, setSelectedMic] = useState<string>('Disabled');
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>();
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>();

    useEffect(() => {
        const localDevices = async () => {
            const devices = await getLocalDevices()
            setVideoDevices(Object.values(devices.videoDevices))
            setAudioDevices(Object.values(devices.audioDevices))
        };
        localDevices();
        
      }, []);
    
    const handleCameraSelected = async (event: any) => {
        console.log(event);
        setSelectedCamera(event.target.value);
    }

    const handleMicSelected = (event: any) => {
        setSelectedMic(event.target.value);
    }

    return (
        <div>
            <Dialog open={props.show} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Welcome!</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please select video and audio input devices
                    </DialogContentText>
                    <InputLabel id="settings-camera-select-input-label">Camera</InputLabel>
                    <Select
                        labelId="settings-camera-select-label"
                        id="settings-camera-select"
                        value={selectedCamera}
                        onChange={handleCameraSelected}
                    >
                        <MenuItem key="camera.disabled" value="Disabled">
                            <em>Disable</em>
                        </MenuItem>
                        {videoDevices?.map((camera) => {
                                return <MenuItem key={camera.deviceId} value={camera.deviceId}>{camera.label}</MenuItem>
                            })
                        }
                    </Select>
                    <InputLabel id="settings-mic-select-input-label">Microphone</InputLabel>
                    <Select
                        labelId="settings-mic-select-label"
                        id="settings-mic-select"
                        value={selectedMic}
                        onChange={handleMicSelected}
                    >
                        <MenuItem key="mic.disabled" value="Disabled">
                            <em>Disable</em>
                        </MenuItem>
                        {audioDevices?.map((mic) => {
                            return <MenuItem key={mic.deviceId} value={mic.deviceId}>{mic.label}</MenuItem>
                        })
                        }
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={() => {
                        const selectedVideoDevice = videoDevices?.find((device) => {
                            return device.deviceId === selectedCamera
                        });
                        const selectedAudioDevice = audioDevices?.find((device) => {
                            return device.deviceId === selectedMic
                        });
                        props.onSubmit(selectedVideoDevice, selectedAudioDevice);
                    }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Settings;