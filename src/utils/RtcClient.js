export default class RtcClient {
  constructor() {
    const config = {
      iceServers: [
        {
          // http://www.stunprotocol.org/
          urls: "stun.stunprotocol.org",
        },
      ],
    };
    this.rtcPeerConnection = new RTCPeerConnection(config);
    this.localPeerName = "";
    this.remotePeerName = "";
  }
}
