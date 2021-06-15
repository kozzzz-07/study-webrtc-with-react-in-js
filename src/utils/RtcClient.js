import FirebaseSignallingClient from "./firebaseSignallingClient";

export default class RtcClient {
  constructor(setRtcClient) {
    // stunprotocol.org
    const config = {
      iceServers: [{ urls: "stun:stun.stunprotocol.org" }],
    };
    this.rtcPeerConnection = new RTCPeerConnection(config);
    this.firebaseSignallingClient = new FirebaseSignallingClient();
    this.localPeerName = "";
    this.remotePeerName = "";
    this._setRtcClient = setRtcClient;
    this.mediaStream = null;
  }

  setRtcClient() {
    this._setRtcClient(this);
  }

  async getUserMedia() {
    try {
      const constraints = { audio: true, video: true };
      // ブラウザで許可を求める通知が出る
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error(error);
    }
  }

  startListening(name) {
    this.localPeerName = name;
    this.setRtcClient();
    // シグナリングサーバーをリスンする
    this.firebaseSignallingClient.database.ref(name).on("value", (snapshot) => {
      const data = snapshot.val();
    });
  }
}
