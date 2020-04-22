import React, { useEffect, useState } from "react";
import { Redirect, useParams } from "react-router-dom";
import { Avatar, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Close, Info, Phone } from "@material-ui/icons";
import moment from "moment";

import BandwidthRtc, {
  SubscriptionEvent,
  RtcStream,
  MediaType,
} from "@bandwidth/webrtc-browser-sdk";

import CallControl from "./CallControl";
import DynamicGrid from "./DynamicGrid";
import Welcome from "./Welcome";
import { randomBrandColorFromString } from "./Utils";

const bandwidthRtc = new BandwidthRtc();
const backendUrl = "";
const phoneNumber = process.env.REACT_APP_PHONE_NUMBER;

const useStyles = makeStyles((theme) => ({
  conference: {
    color: "#fff",
  },
  conferenceNoCursor: {
    cursor: "none",
    color: "#fff",
  },
  sessionInfoWrapper: {
    position: "absolute",
    left: "20px",
    top: "20px",
    width: "30%",
    zIndex: 10,
  },
  sessionInfoOpen: {
    opacity: 0.5,
    backgroundColor: "rgba(0, 0, 0, 0.87)",
    borderRadius: "20px",
    cursor: "pointer",
    transition: "opacity .25s ease-in-out",
  },
  sessionInfoOpenHidden: {
    opacity: 0,
    transition: "opacity .5s ease-in-out",
  },
  sessionInfoClose: {
    opacity: 1,
    cursor: "pointer",
  },
  sessionInfo: {
    opacity: 0.9,
    position: "absolute",
    left: "-10px",
    top: "-10px",
    color: "rgba(0, 0, 0, 0.87)",
    backgroundColor: "#E0E0E0",
    border: "1px solid rgba(0, 0, 0, 0.87);",
    borderRadius: "10px",
    padding: "10px",
    "& ul": {
      listStyleType: "none",
      margin: "0",
      paddingInlineStart: "0px",
      "& li": {
        padding: "3px",
        "& h4": {
          margin: "0",
        },
      },
    },
  },
  video: {
    left: "50%",
    minHeight: "100%",
    minWidth: "100%",
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
  },
  localVideo: {
    right: "20px",
    position: "absolute",
    top: "20px",
    transform: "scaleX(-1)",
    borderRadius: "10px",
    zIndex: 10,
    border: "1px solid rgba(255, 255, 255, 0.33)",
    maxWidth: "200px",
    boxShadow: "0px 4px 20px rgba(0,0,0,0.5)",
    opacity: 1,
    transition: "opacity .5s ease-in-out",
    "&:hover": {
      opacity: 0,
      transition: "opacity .1s ease-in-out",
    },
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
  callControl: {
    opacity: 1,
    transition: "opacity .25s ease-in-out",
  },
  callControlHidden: {
    opacity: 0,
    transition: "opacity .5s ease-in-out",
  },
}));

let immersiveModeTimeout: NodeJS.Timeout | null = null;

interface SessionInfoProps {
  immersiveMode: boolean;
  userAgent: string;
  conferenceId?: string;
  participantId?: string;
  localStream?: string;
  remoteStreams: string[];
  error?: { message: string; datetime: string };
}

const SessionInfo: React.FC<SessionInfoProps> = (props) => {
  const classes = useStyles();
  const [sessionInfoEnabled, setSessionInfoEnabled] = useState(false);

  if (sessionInfoEnabled) {
    return (
      <div className={classes.sessionInfoWrapper}>
        <Box className={classes.sessionInfo}>
          <Close
            className={classes.sessionInfoClose}
            onClick={() => {
              setSessionInfoEnabled(false);
            }}
          />
          <ul>
            <li>
              <h4>User-Agent</h4>
              <div>{props.userAgent}</div>
            </li>
            {props.conferenceId && (
              <li>
                <h4>Conference Id</h4>
                <div>{props.conferenceId}</div>
              </li>
            )}
            {props.participantId && (
              <li>
                <h4>Participant Id</h4>
                <div>{props.participantId}</div>
              </li>
            )}
            {props.localStream && (
              <li>
                <h4>Local Stream</h4>
                <div>{props.localStream}</div>
              </li>
            )}
            {props.remoteStreams.length > 0 && (
              <li>
                <h4>Remote Streams</h4>
                <ul>
                  {props.remoteStreams.map((rs) => (
                    <li key={rs}>
                      <div>{rs}</div>
                    </li>
                  ))}
                </ul>
              </li>
            )}
            {props.error && (
              <li>
                <h4>Error</h4>
                <div>{props.error.datetime}</div>
                <div>{props.error.message}</div>
              </li>
            )}
          </ul>
        </Box>
      </div>
    );
  } else {
    return (
      <div className={classes.sessionInfoWrapper}>
        <Info
          className={
            props.immersiveMode
              ? classes.sessionInfoOpenHidden
              : classes.sessionInfoOpen
          }
          onClick={() => {
            setSessionInfoEnabled(true);
          }}
        />
      </div>
    );
  }
};

const Conference: React.FC = (props) => {
  const userAgent = window.navigator.userAgent;
  const classes = useStyles();
  let { slug } = useParams();
  const [conferenceId, setConferenceId] = useState<string>();
  const [participantId, setParticipantId] = useState<string>();
  const [deviceToken, setDeviceToken] = useState<string>();
  const [remoteStreams, setRemoteStreams] = useState<{
    [key: string]: RtcStream;
  }>({});
  const [localStream, setLocalStream] = useState<RtcStream>();
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string>();
  const [error, setError] = useState<{
    message: string;
    datetime: string;
  }>();

  useEffect(() => {
    async function createParticipant(slug: string) {
      const response = await fetch(
        `${backendUrl}/conferences/${slug}/participants`,
        {
          method: "POST",
          body: JSON.stringify({ name: "" }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const error = await response.text();
        throw new Error(
          `Request to create participant returned ${response.status}, message=${error}`
        );
      }
      return await response.json();
    }

    async function init() {
      if (slug) {
        try {
          const responseBody = await createParticipant(slug);
          const conferenceId = responseBody.conferenceId;
          const participantId = responseBody.participantId;
          const deviceToken = responseBody.deviceToken;

          setConferenceId(conferenceId);
          setParticipantId(participantId);
          setDeviceToken(deviceToken);

          let options: any = {};
          if (responseBody.websocketUrl) {
            options.websocketUrl = responseBody.websocketUrl;
          }
          await bandwidthRtc.connect(
            {
              deviceToken: deviceToken,
            },
            options
          );
          const publishResponse = await bandwidthRtc.publish();
          setLocalStream(publishResponse);
        } catch (e) {
          setError({
            message: e.toString() as string,
            datetime: moment().format(),
          });
        }
      }
    }

    init();
  }, [slug]);

  useEffect(() => {
    bandwidthRtc.onSubscribe((stream: RtcStream) => {
      setRemoteStreams({
        ...remoteStreams,
        [stream.streamId]: stream,
      });
    });

    bandwidthRtc.onUnsubscribed((event: SubscriptionEvent) => {
      const {
        [event.streamId]: oldStream,
        ...remainingStreams
      } = remoteStreams;
      setRemoteStreams(remainingStreams);
    });
  }, [remoteStreams]);

  useEffect(() => {
    if (immersiveModeTimeout) {
      clearTimeout(immersiveModeTimeout);
    }
    immersiveModeTimeout = setTimeout(() => {
      setImmersiveMode(true);
    }, 3000);
    return () => {
      if (immersiveModeTimeout) {
        clearTimeout(immersiveModeTimeout);
      }
    };
  }, [immersiveMode]);

  return (
    <div
      className={
        immersiveMode ? classes.conferenceNoCursor : classes.conference
      }
      onMouseMove={() => setImmersiveMode(false)}
    >
      <SessionInfo
        immersiveMode={immersiveMode}
        userAgent={userAgent}
        conferenceId={conferenceId}
        participantId={participantId}
        localStream={localStream && localStream.streamId}
        remoteStreams={Object.keys(remoteStreams)}
        error={error}
      />

      <video
        id="localVideoPreview"
        playsInline
        autoPlay
        muted
        className={classes.localVideo}
        ref={(localVideoElement) => {
          if (
            localVideoElement &&
            localStream &&
            localVideoElement.srcObject !== localStream.mediaStream
          ) {
            localVideoElement.srcObject = localStream.mediaStream;
          }
        }}
      ></video>

      <DynamicGrid>
        {Object.keys(remoteStreams).length > 0 ? (
          Object.keys(remoteStreams).map((streamId: string) => {
            const remoteStream = remoteStreams[streamId];
            if (remoteStream.mediaType === MediaType.AUDIO) {
              return (
                <div className={classes.phoneWrapper}>
                  <Avatar
                    className={classes.phoneIcon}
                    key={streamId}
                    style={{
                      backgroundColor: randomBrandColorFromString(
                        remoteStream.streamId
                      ),
                    }}
                  >
                    <Phone className={classes.iconFont} />
                  </Avatar>
                  <video
                    playsInline
                    autoPlay
                    className={classes.hiddenVideo}
                    key={streamId}
                    ref={(remoteVideoElement) => {
                      if (
                        remoteVideoElement &&
                        remoteStream &&
                        remoteVideoElement.srcObject !==
                          remoteStream.mediaStream
                      ) {
                        remoteVideoElement.srcObject = remoteStream.mediaStream;
                      }
                    }}
                  ></video>
                </div>
              );
            } else {
              return (
                <video
                  playsInline
                  autoPlay
                  className={classes.video}
                  key={streamId}
                  ref={(remoteVideoElement) => {
                    if (
                      remoteVideoElement &&
                      remoteStream &&
                      remoteVideoElement.srcObject !== remoteStream.mediaStream
                    ) {
                      remoteVideoElement.srcObject = remoteStream.mediaStream;
                    }
                  }}
                ></video>
              );
            }
          })
        ) : (
          <Welcome
            conferenceId={conferenceId}
            phoneNumber={phoneNumber}
          ></Welcome>
        )}
      </DynamicGrid>

      <CallControl
        className={
          immersiveMode ? classes.callControlHidden : classes.callControl
        }
        onMicEnabled={bandwidthRtc.setMicEnabled}
        onCameraEnabled={bandwidthRtc.setCameraEnabled}
        onHangup={() => {
          bandwidthRtc.disconnect();
          setRedirectTo("/");
        }}
      >
        >
      </CallControl>
      {redirectTo != null ? <Redirect to={redirectTo}></Redirect> : undefined}
    </div>
  );
};

export default Conference;
