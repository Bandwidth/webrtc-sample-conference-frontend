import React, {useState} from 'react';
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


interface DeviceSelectorProps {
    onSubmit: { (selectedVideoDevice: string, selectedAudioDevice: string): void };
    videoDevices?: MediaDeviceInfo[];
    audioDevices?: MediaDeviceInfo[];
}

const DeviceSelector: React.FC<DeviceSelectorProps> = (props) => {
    const [selectedCamera, setSelectedCamera] = useState<string>('Disabled');
    const [selectedMic, setSelectedMic] = useState<string>('Disabled');

    const handleCameraSelected = async (event: any) => {
        let devices = await getLocalDevices()
        console.log('Hi1')
        console.log(devices)
        setSelectedCamera(event.target.value);
    }

    const handleMicSelected = (event: any) => {
        setSelectedMic(event.target.value);
    }

    return (
        <div>
            <Dialog open={true} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Welcome!</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please select video and audio input devices
                    </DialogContentText>
                    <InputLabel id="device-selector-camera-select-input-label">Camera</InputLabel>
                    <Select
                        labelId="device-selector-camera-select-label"
                        id="device-selector-camera-select"
                        value={selectedCamera}
                        onChange={handleCameraSelected}
                    >
                        <MenuItem key="camera.disabled" value="Disabled">
                            <em>Disable</em>
                        </MenuItem>
                        {props.videoDevices?.map((camera) => {
                                return <MenuItem key={camera.deviceId} value={camera.deviceId}>{camera.label}</MenuItem>
                            })
                        }
                    </Select>
                    <InputLabel id="device-selector-mic-select-input-label">Microphone</InputLabel>
                    <Select
                        labelId="device-selector-mic-select-label"
                        id="device-selector-mic-select"
                        value={selectedMic}
                        onChange={handleMicSelected}
                    >
                        <MenuItem key="mic.disabled" value="Disabled">
                            <em>Disable</em>
                        </MenuItem>
                        {props.audioDevices?.map((mic) => {
                            return <MenuItem key={mic.deviceId} value={mic.deviceId}>{mic.label}</MenuItem>
                        })
                        }
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={() => {
                        props.onSubmit(selectedCamera, selectedMic);
                    }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DeviceSelector;