/**
 * Stores information about the user's TURN Server preferences
 */

const setTURNConfig = (turnConfig: RTCIceServer | undefined) => {
  if (!turnConfig) {
    localStorage.removeItem('turnConfig');
    return;
  }
  localStorage.setItem('turnConfig', JSON.stringify(turnConfig));
}

const getTURNConfig = (): RTCIceServer | undefined => {
  const turnConfig = localStorage.getItem('turnConfig');
  if (!turnConfig) {
    return undefined;
  } else {
    return JSON.parse(turnConfig);
  }
}

export { setTURNConfig, getTURNConfig };
