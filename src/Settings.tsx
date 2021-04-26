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
import { Close } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

import { getDevicePreference, getLocalDevices } from './services/local-devices';
import { CircularProgress, Grid } from '@material-ui/core';

interface SettingsProps {
    toggleSettings: { (): void};
    onSubmit: { (selectedVideoDevice: MediaDeviceInfo | undefined, selectedAudioDevice: MediaDeviceInfo | undefined): void };
}

const Settings: React.FC<SettingsProps> = (props) => {
    const [selectedCamera, setSelectedCamera] = useState<string>('Disabled');
    const [selectedMic, setSelectedMic] = useState<string>('Disabled');
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>();
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>();
    const [videoStream, setVideoStream] = useState<MediaStream>();
    const [loading, setLoading] = useState<boolean>(true);

    const useStyles = makeStyles((theme) => ({
        videoTheme: {
            maxWidth: '300px'
        }
    }));
    const classes = useStyles()

    useEffect(() => {
        const localDevices = async () => {
            const devices = await getLocalDevices()
            setVideoDevices(Object.values(devices.videoDevices))
            setAudioDevices(Object.values(devices.audioDevices))
            const devicePreference = getDevicePreference()
            if (devicePreference.audioDevice && devices.audioDevices) {
                if (Object.values(devices.audioDevices).filter((value) => value.deviceId === devicePreference.audioDevice?.deviceId).length !== 0) {
                    setSelectedMic(devicePreference.audioDevice.deviceId)
                }
            }
            if (devicePreference.videoDevice && devices.videoDevices) {
                if (Object.values(devices.videoDevices).filter((value) => value.deviceId === devicePreference.videoDevice?.deviceId).length !== 0) {
                    setSelectedCamera(devicePreference.videoDevice.deviceId)
                    let cameraStream = await getVideoStream(devicePreference.videoDevice.deviceId);
                    if (cameraStream) {
                        setVideoStream(cameraStream)
                    }
                }
            }
            setLoading(false);
        };
        localDevices();
        
      }, []);

    const closeModal = () => {
        videoStream?.getTracks().forEach(track => track.stop())
        props.toggleSettings()
    }

    const getVideoStream = async (deviceId: string): Promise<MediaStream> => {
        return await navigator.mediaDevices.getUserMedia({video: {deviceId: deviceId}, audio: false });
    }
    
    const handleCameraSelected = async (event: any) => {
        setLoading(true)
        videoStream?.getTracks().forEach(track => track.stop())
        let cameraStream = await getVideoStream(event.target.value);
        if (cameraStream) {
            setVideoStream(cameraStream)
        }
        setSelectedCamera(event.target.value);
        setLoading(false)
    }

    const handleMicSelected = (event: any) => {
        setSelectedMic(event.target.value);
    }

    const handleClose = async () => {
        const selectedVideoDevice = videoDevices?.find((device) => {
            return device.deviceId === selectedCamera
        });
        const selectedAudioDevice = audioDevices?.find((device) => {
            return device.deviceId === selectedMic
        });
 
        videoStream?.getTracks().forEach(track => track.stop())
        await props.onSubmit(selectedVideoDevice, selectedAudioDevice);
    }

    return (
        <div>
            <Dialog open={true} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="center">
                    Settings
                    <Button size="small" onClick={closeModal}><Close></Close></Button>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please select video and audio input devices
                    </DialogContentText>
                    {loading && 
                        <CircularProgress />
                    }
                    {!loading &&
                        <video
                            className={classes.videoTheme}
                            id="localVideoPreview"
                            autoPlay
                            muted
                            ref={(localVideoElement) => {
                                if (localVideoElement && videoStream)
                                    localVideoElement.srcObject = videoStream;
                            }}
                        />
                    }
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
                    <Button color="primary" onClick={handleClose}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Settings;