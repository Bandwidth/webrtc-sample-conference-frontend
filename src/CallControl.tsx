import React from "react";
import { Fab, Box } from "@material-ui/core";
import {
  CallEnd,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  PresentToAll,
} from "@material-ui/icons";
import SettingsIcon from "@material-ui/icons/Settings";
import { makeStyles } from "@material-ui/core/styles";
import { red, green } from "@material-ui/core/colors";

interface CallControlProps {
  className?: string;
  isMicEnabled: boolean;
  onToggleMic?: { (): void };
  onToggleSettings?: { (): void };
  isCameraEnabled: boolean;
  onToggleCamera?: { (): void };
  isScreenShareEnabled: boolean;
  onToggleScreenShare?: { (): void };
  onHangup?: { (): void };
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

  return (
    <div className={props.className}>
      <Box className={classes.callControl}>
        <Fab
            onClick={() => {
              if (props.onToggleMic) {
                props.onToggleMic();
              }
            }}
            className={props.isMicEnabled ? classes.redButton : classes.redButtonPressed}
        >
          {props.isMicEnabled ? <Mic/> : <MicOff/>}
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
            if (props.onToggleCamera) {
              props.onToggleCamera();
            }
          }}
          className={
            props.isCameraEnabled ? classes.redButton : classes.redButtonPressed
          }
        >
          {props.isCameraEnabled ? <Videocam /> : <VideocamOff />}
        </Fab>
        <Fab
          onClick={() => {
            if (props.onToggleScreenShare) {
              props.onToggleScreenShare();
            }
          }}
          className={
            !props.isScreenShareEnabled
              ? classes.greenButton
              : classes.greenButtonPressed
          }
        >
          <PresentToAll />
        </Fab>
        <Fab
          onClick={() => {
            if (props.onToggleSettings) {
              props.onToggleSettings();
            }
          }}>
          <SettingsIcon />
        </Fab>
      </Box>
    </div>
  );
};

export default CallControl;
