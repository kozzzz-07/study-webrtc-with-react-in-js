import FirebaseSignallingClient from "./firebaseSignallingClient";

export default class RtcClient {
  constructor(remoteVideoRef, setRtcClient) {
    // stunprotocol.org
    const config = {
      iceServers: [{ urls: "stun:stun.stunprotocol.org" }],
    };
    this.rtcPeerConnection = new RTCPeerConnection(config);
    this.firebaseSignallingClient = new FirebaseSignallingClient();
    this.localPeerName = "";
    this.remotePeerName = "";
    this.remoteVideoRef = remoteVideoRef;
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

  async setMediaStream() {
    await this.getUserMedia();
    this.addTracks();
    this.setRtcClient();
  }

  addTracks() {
    this.addAudioTrack();
    this.addVideoTrack();
  }

  addAudioTrack() {
    // ローカルピアからリモートピアへaudioのトラック情報を伝える
    this.rtcPeerConnection.addTrack(this.audioTrack, this.mediaStream);
  }

  addVideoTrack() {
    // ローカルピアからリモートピアへaudioのトラック情報を伝える
    this.rtcPeerConnection.addTrack(this.videoTrack, this.mediaStream);
  }

  get audioTrack() {
    return this.mediaStream.getAudioTracks()[0];
  }

  get videoTrack() {
    return this.mediaStream.getVideoTracks()[0];
  }

  setOnTrack() {
    // リモートからメディアストリームを受け取る
    this.rtcPeerConnection.ontrack = (rtcTrackEvent) => {
      if (rtcTrackEvent.track.kind !== "video") {
        return;
      }
      const remoteMediaStream = rtcTrackEvent.streams[0];
      this.remoteVideoRef.current.srcObject = remoteMediaStream;
      this.setRtcClient();
    };
    this.setRtcClient();
  }

  connect(remotePeerName) {
    this.remotePeerName = remotePeerName;
    this.setOnicecandidateCallback();
    this.setRtcClient();
  }

  setOnicecandidateCallback() {
    this.rtcPeerConnection.onicecandidate = ({ candidate }) => {
      if (candidate) {
        // TODO: remoteへcandidateを通知する
      }
    };
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
