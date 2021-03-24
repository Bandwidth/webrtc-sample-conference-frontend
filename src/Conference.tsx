import React, { useEffect, useState } from "react";
import { Redirect, useLocation, useParams } from "react-router-dom";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Close, Info, MicOff } from "@material-ui/icons";

import moment from "moment";

import BandwidthRtc, { RtcStream, RtcOptions } from "@bandwidth/webrtc-browser";

import CallControl from "./CallControl";
import DynamicGrid from "./DynamicGrid";
import Lobby from "./Lobby";
import Welcome from "./Welcome";
import Participant from "./Participant";
import {red} from "@material-ui/core/colors";

const bandwidthRtc = new BandwidthRtc("debug");

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
  localVideo: {
    position: "absolute",
    right: "20px",
    top: "20px",
    zIndex: 10,
    transform: "scaleX(-1)",
    borderRadius: "10px",
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
  localVideoMicOff: {
    position: "absolute",
    right: "20px",
    top: "20px",
    zIndex: 10,
    color: "white",
    backgroundColor: red["A700"]
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
  conferenceCode?: string;
  conferencePhoneNumber?: string
  participantId?: string;
  localStream?: RtcStream;
  remoteStreams: RtcStream[];
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
            {props.conferenceCode && (
                <li>
                  <h4>Conference Code</h4>
                  <div>{props.conferenceCode}</div>
                </li>
            )}
            {props.conferencePhoneNumber && (
                <li>
                  <h4>Conference Phone Number</h4>
                  <div>{props.conferencePhoneNumber}</div>
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
                <div>{props.localStream.endpointId} {props.localStream.alias}</div>
              </li>
            )}
            {props.remoteStreams.length > 0 && (
              <li>
                <h4>Remote Streams</h4>
                <ul>
                  {props.remoteStreams.map((rs) => (
                    <li key={rs.endpointId}>
                      <div>{rs.endpointId} {rs.alias}</div>
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
          className={props.immersiveMode ? classes.sessionInfoOpenHidden : classes.sessionInfoOpen}
          onClick={() => {
            setSessionInfoEnabled(true);
          }}
        />
      </div>
    );
  }
};

/**
 * Stores information about each audio and video device, keyed by device ID.
 */
interface DeviceData {
  audioDevices: {[key: string]: MediaDeviceInfo};
  videoDevices: {[key: string]: MediaDeviceInfo};
}

/**
 * Stores info about the devices selected in the Lobby.
 */
interface DeviceSelectionData {
  selectedVideo?: MediaDeviceInfo;
  selectedAudio?: MediaDeviceInfo;
}

const Conference: React.FC = (props) => {
  const userAgent = window.navigator.userAgent;
  const classes = useStyles();
  let { slug } = useParams();
  let location = useLocation();
  const [displayDialog, setDisplayDialog] = useState(true);
  const [deviceSelectionData, setDeviceSelectionData] = useState<DeviceSelectionData>();
  const [conferenceId, setConferenceId] = useState<string>();
  const [conferenceCode, setConferenceCode] = useState<string>();
  const [participantId, setParticipantId] = useState<string>();
  const [deviceToken, setDeviceToken] = useState<string>();
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [localDevices, setLocalDevices] = useState<DeviceData>({
    audioDevices: {},
    videoDevices: {}
  });
  const [remoteStreams, setRemoteStreams] = useState<{
    [key: string]: RtcStream;
  }>({});
  const [localStream, setLocalStream] = useState<RtcStream>();
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string>();
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [screenShareStream, setScreenShareStream] = useState<RtcStream>();
  const [error, setError] = useState<{
    message: string;
    datetime: string;
  }>();

  const onVideoClickHandler = (streamId: string, index: number) => {
    if (index === selectedVideoIndex) {
      setSelectedVideoIndex(null);
      setSelectedStreamId(null);
    } else {
      setSelectedVideoIndex(index);
      setSelectedStreamId(streamId);
    }
  };

  const handleToggleMic = () => {
    console.log("handleToggleMic, new micEnabled=" + !micEnabled);
    setMicEnabled(!micEnabled);
  };

  const handleToggleCamera = () => {
    console.log("handleToggleCamera, new cameraEnabled=" + !cameraEnabled);
    setCameraEnabled(!cameraEnabled);
  };

  const handleToggleScreenShare = () => {
    console.log("handleToggleScreenShare, new screenShareEnabled=" + !screenShareEnabled);
    setScreenShareEnabled(!screenShareEnabled);
  };

  useEffect(() => {
    if (localStream) {
      bandwidthRtc.setMicEnabled(micEnabled);
    }
  }, [micEnabled, localStream]);

  useEffect(() => {
    if (localStream) {
      bandwidthRtc.setCameraEnabled(cameraEnabled, localStream);
    }
  }, [cameraEnabled, localStream]);

  useEffect(() => {
    if (screenShareEnabled && !screenShareStream) {
      navigator.mediaDevices
          //@ts-ignore
          .getDisplayMedia({
            video: true,
          })
          .then(async (stream: MediaStream) => {
            const screenShareStream = await bandwidthRtc.publish(stream, undefined, 'screenshare');
            setScreenShareStream(screenShareStream);
            console.log("published screenshare", screenShareStream);
          })
          .catch((e: Error) => {
            console.error(e);
          });
    } else {
      if (!screenShareEnabled && screenShareStream) {
        try {
          bandwidthRtc.unpublish(screenShareStream);
        } finally {
          setScreenShareStream(undefined);
          console.log("unpublished screenshare", screenShareStream);
        }
      }
    }
  }, [screenShareEnabled, screenShareStream]);

  const handleLobbySubmit = (videoDeviceId: string, audioDeviceId: string) => {
    console.log('handleLobbySubmit called, videoDeviceId: ' + videoDeviceId + ' audioDevice: ' + audioDeviceId);
    setDisplayDialog(false);

    let newConnectionInfo:DeviceSelectionData = {};
    if (videoDeviceId !== "Disabled") {
      newConnectionInfo.selectedVideo = localDevices.videoDevices[videoDeviceId];
    }
    if (audioDeviceId !== "Disabled") {
      newConnectionInfo.selectedAudio = localDevices.audioDevices[audioDeviceId];
    }
    setDeviceSelectionData(newConnectionInfo);
  }

  useEffect(() => {
    /**
     * Check that we have WebRTC permissions
     * - if you .then() this function on your first use of getUserMedia then you can avoid
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

    async function initDevices() {
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

      setLocalDevices({
        videoDevices: vDevices,
        audioDevices: aDevices
      });
    }

    try {
      initDevices();
    } catch (e) {
      alert(
          "Sorry, you'll need to provide WebRTC input device access to use this app. Please reload and accept permissions"
      );
      console.log(`Can't move forward without WebRTC Permissions`);
    }
  }, []);

  useEffect(() => {
    async function createParticipant(slug: string, version?: string) {
      let url = `/conferences/${slug}/participants`;
      if (version) {
        url = `${url}?version=${version}`;
      }
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ name: "" }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Request to create participant returned ${response.status}, message=${error}`);
      }
      return await response.json();
    }

    async function init() {
      if (slug && deviceSelectionData) {
        try {
          const queryParams = new URLSearchParams(location.search);
          const responseBody = await createParticipant(slug, queryParams.get("version") || undefined);
          const conferenceCode = responseBody.conferenceCode;
          const conferenceId = responseBody.conferenceId;
          const participantId = responseBody.participantId;
          const deviceToken = responseBody.deviceToken;
          const phoneNumber = responseBody.phoneNumber;

          setConferenceId(conferenceId);
          setConferenceCode(conferenceCode);
          setParticipantId(participantId);
          setDeviceToken(deviceToken);
          setPhoneNumber(phoneNumber);

          let options: RtcOptions = {};
          if (responseBody.websocketUrl) {
            options.websocketUrl = responseBody.websocketUrl;
          }
          await bandwidthRtc.connect(
            {
              deviceToken: deviceToken,
            },
            options
          );

          let mediaConstraints:MediaStreamConstraints = {
            video: false,
            audio: false
          }
          if (deviceSelectionData.selectedVideo) {
            mediaConstraints.video = {
              deviceId: deviceSelectionData.selectedVideo.deviceId
            };
          }
          if (deviceSelectionData.selectedAudio) {
            mediaConstraints.audio = {
              deviceId: deviceSelectionData.selectedAudio.deviceId
            };
          }

          try {
            const publishResponse = await bandwidthRtc.publish(
                mediaConstraints,
                undefined,
                'usermedia'
                );
            setLocalStream(publishResponse);
          } catch (e) {
            console.log("Error publishing... Skipping", e);
          }
        } catch (e) {
          console.log("Error joining conference", e);
          setError({
            message: e.toString() as string,
            datetime: moment().format(),
          });
        }
      }
    }

    init();
  }, [slug, deviceSelectionData, location]);

  useEffect(() => {
    bandwidthRtc.onStreamAvailable((stream: RtcStream) => {
      console.log("onStreamAvailable", stream);
      setRemoteStreams(currentStreams => {
        return {
          ...currentStreams,
          [stream.endpointId]: stream,
        };
      });
    });

    bandwidthRtc.onStreamUnavailable((streamId: string) => {
      console.log("onStreamUnavailable", streamId);
      setRemoteStreams(currentStreams => {
        const { [streamId]: removedStream, ...remainingStreams } = currentStreams;
        return remainingStreams;
      });
      if (streamId === selectedStreamId) {
        setSelectedStreamId(null);
        setSelectedVideoIndex(null);
      }
    });
  }, [remoteStreams, selectedStreamId, selectedVideoIndex]);

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

  if (displayDialog) {
    return <Lobby onSubmit={handleLobbySubmit}
                  videoDevices={Object.values(localDevices.videoDevices)}
                  audioDevices={Object.values(localDevices.audioDevices)}
    />
  } else {
    return (
        <div
            className={immersiveMode ? classes.conferenceNoCursor : classes.conference}
            onMouseMove={() => setImmersiveMode(false)}
        >
          <SessionInfo
              immersiveMode={immersiveMode}
              userAgent={userAgent}
              conferenceId={conferenceId}
              conferenceCode={conferenceCode}
              conferencePhoneNumber={phoneNumber}
              participantId={participantId}
              localStream={localStream}
              remoteStreams={Object.values(remoteStreams)}
              error={error}
          />

      <div id="videoDiv">
        <video
          id="localVideoPreview"
          playsInline
          autoPlay
          muted
          className={classes.localVideo}
          ref={(localVideoElement) => {
            if (localVideoElement && localStream && localVideoElement.srcObject !== localStream.mediaStream) {
              localVideoElement.srcObject = localStream.mediaStream;
            }
          }}
        />
        {micEnabled ? undefined : <MicOff className={classes.localVideoMicOff}/>}
      </div>

          <DynamicGrid selectedIndex={selectedVideoIndex}>
            {Object.keys(remoteStreams).length > 0 ? (
                Object.values(remoteStreams).map((rtcStream: RtcStream, index) => {
                  return (
                      <Participant
                          key={index}
                          rtcStream={rtcStream}
                          onClick={() => {
                            onVideoClickHandler(rtcStream.endpointId, index);
                          }}
                          cropped={index !== selectedVideoIndex}
                      />
                  );
                })
            ) : (
                <Welcome conferenceId={conferenceId} phoneNumber={phoneNumber}
                         conferenceCode={conferenceCode}></Welcome>
            )}
          </DynamicGrid>
          <CallControl
              className={immersiveMode ? classes.callControlHidden : classes.callControl}
              isMicEnabled={micEnabled}
              onToggleMic={handleToggleMic}
              isCameraEnabled={cameraEnabled}
              onToggleCamera={handleToggleCamera}
              isScreenShareEnabled={screenShareEnabled}
              onToggleScreenShare={handleToggleScreenShare}
              onHangup={() => {
                bandwidthRtc.disconnect();
                setRedirectTo("/");
              }}
          />
          {redirectTo != null ? <Redirect to={redirectTo}></Redirect> : undefined}
        </div>
    );
  }
};

export default Conference;
