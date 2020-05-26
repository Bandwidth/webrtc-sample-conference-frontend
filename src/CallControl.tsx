import React, { useState } from "react";
import { Fab, Box } from "@material-ui/core";
import {
  CallEnd,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  PresentToAll,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { red, green } from "@material-ui/core/colors";

interface CallControlProps {
  className?: string;
  onMicEnabled?: { (enabled: boolean): void };
  onCameraEnabled?: { (enabled: boolean): void };
  onHangup?: { (): void };
  onScreenShareEnabled?: { (enabled: boolean): void };
}

const useStyles = makeStyles((theme) => ({
  callControl: {
    backgroundColor: "rgba(255, 255, 255, 0.50)",
    backdropFilter: "blur(5px)",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    height: "auto",
    "& button": {
      margin: "10px",
    },
  },
  redButton: {
    "&:hover": {
      color: "white",
      backgroundColor: red["A700"],
    },
  },
  greenButton: {
    "&:hover": {
      color: "white",
      backgroundColor: green["A700"],
    },
  },
  redButtonPressed: {
    color: "white",
    backgroundColor: red["A700"],
    "&:hover": {
      color: "white",
      backgroundColor: red["A700"],
    },
  },
  greenButtonPressed: {
    color: "white",
    backgroundColor: green["A700"],
    "&:hover": {
      color: "white",
      backgroundColor: red["A700"],
    },
  },
}));

const CallControl: React.FC<CallControlProps> = (props) => {
  const classes = useStyles();

  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);

  return (
    <div className={props.className}>
      <Box className={classes.callControl}>
        <Fab
          onClick={() => {
            setMicEnabled(!micEnabled);
            if (props.onMicEnabled) {
              props.onMicEnabled(!micEnabled);
            }
          }}
          className={micEnabled ? classes.redButton : classes.redButtonPressed}
        >
          {micEnabled ? <Mic /> : <MicOff />}
        </Fab>
        <Fab
          className={classes.redButton}
          onClick={() => {
            if (props.onHangup) {
              props.onHangup();
            }
          }}
        >
          <CallEnd />
        </Fab>
        <Fab
          onClick={() => {
            setCameraEnabled(!cameraEnabled);
            if (props.onCameraEnabled) {
              props.onCameraEnabled(!cameraEnabled);
            }
          }}
          className={
            cameraEnabled ? classes.redButton : classes.redButtonPressed
          }
        >
          {cameraEnabled ? <Videocam /> : <VideocamOff />}
        </Fab>
        <Fab
          onClick={() => {
            setScreenShareEnabled(!screenShareEnabled);
            if (props.onScreenShareEnabled) {
              props.onScreenShareEnabled(!screenShareEnabled);
            }
          }}
          className={
            !screenShareEnabled
              ? classes.greenButton
              : classes.greenButtonPressed
          }
        >
          <PresentToAll />
        </Fab>
      </Box>
    </div>
  );
};

export default CallControl;
