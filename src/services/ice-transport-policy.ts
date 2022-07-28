/**
 * Stores information about the user's ICE Transport Policy preferences
 */
 
const setIceTransportPolicy = (iceTransportPolicy: RTCIceTransportPolicy | undefined) => {
  if (!iceTransportPolicy) {
      localStorage.removeItem('iceTransportPolicy');
    return;
  }
  localStorage.setItem('iceTransportPolicy', iceTransportPolicy);
}

const getIceTransportPolicy = (): RTCIceTransportPolicy | undefined => {
  const iceTransportPolicy = localStorage.getItem('iceTransportPolicy');
  if (!iceTransportPolicy) {
    return 'all' as RTCIceTransportPolicy;
  } else {
    return iceTransportPolicy as RTCIceTransportPolicy;
  }
}

export { setIceTransportPolicy, getIceTransportPolicy};
