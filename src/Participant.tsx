import React from "react";
import { RtcStream, MediaType } from "@bandwidth/webrtc-browser";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import { randomBrandColorFromString } from "./Utils";
import { Phone } from "@material-ui/icons";

export interface ParticipantProps {
  rtcStream: RtcStream;
  onClick?: { (): void };
  cropped?: boolean;
}

const useStyles = makeStyles((theme) => ({
  video: {
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  croppedVideo: {
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  hiddenVideo: {
    display: "none",
  },
  phoneWrapper: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  phoneIcon: {
    fontSize: "10vw",
    height: "auto",
    width: "auto",
    padding: "2vw",
  },
  iconFont: {
    fontSize: "10vw",
  },
}));

const Participant: React.FC<ParticipantProps> = (props) => {
  const classes = useStyles();

  if (!props.rtcStream.mediaTypes.includes(MediaType.VIDEO)) {
    return (
      <div className={classes.phoneWrapper}>
        <Avatar
          className={classes.phoneIcon}
          style={{
            backgroundColor: randomBrandColorFromString(
              props.rtcStream.endpointId
            ),
          }}
        >
          <Phone className={classes.iconFont} />
        </Avatar>
        <video
          playsInline
          autoPlay
          className={classes.hiddenVideo}
          key={props.rtcStream.endpointId}
          ref={(remoteVideoElement) => {
            if (
              remoteVideoElement &&
              props.rtcStream.mediaStream &&
              remoteVideoElement.srcObject !== props.rtcStream.mediaStream
            ) {
              remoteVideoElement.srcObject = props.rtcStream.mediaStream;
            }
          }}
        ></video>
      </div>
    );
  } else {
    return (
      <video
        onClick={props.onClick}
        playsInline
        autoPlay
        className={props.cropped ? classes.croppedVideo : classes.video}
        key={props.rtcStream.endpointId}
        ref={(remoteVideoElement) => {
          if (
            remoteVideoElement &&
            props.rtcStream.mediaStream &&
            remoteVideoElement.srcObject !== props.rtcStream.mediaStream
          ) {
            remoteVideoElement.srcObject = props.rtcStream.mediaStream;
          }
        }}
      ></video>
    );
  }
};

export default Participant;
