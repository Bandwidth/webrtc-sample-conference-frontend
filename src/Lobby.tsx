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


interface LobbyProps {
    onSubmit: { (selectedVideoDevice: string, selectedAudioDevice: string): void };
    videoDevices?: MediaDeviceInfo[];
    audioDevices?: MediaDeviceInfo[];
}

const Lobby: React.FC<LobbyProps> = (props) => {
    const [selectedCamera, setSelectedCamera] = useState<string>('Disabled');
    const [selectedMic, setSelectedMic] = useState<string>('Disabled');

    const handleCameraSelected = (event: any) => {
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
                        Please select a video and audio input devices
                    </DialogContentText>
                    <InputLabel id="lobby-camera-select-input-label">Camera</InputLabel>
                    <Select
                        labelId="lobby-camera-select-label"
                        id="lobby-camera-select"
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
                    <InputLabel id="lobby-mic-select-input-label">Microphone</InputLabel>
                    <Select
                        labelId="lobby-mic-select-label"
                        id="lobby-mic-select"
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
                        Join Conference
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Lobby;