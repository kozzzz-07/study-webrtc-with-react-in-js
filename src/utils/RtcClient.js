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

  async offer() {
    const sessionDescription = await this.createOffer();
    await this.setLocalDescription(sessionDescription);
    await this.sendOffer();
  }

  async createOffer() {
    try {
      return await this.rtcPeerConnection.createOffer();
    } catch (error) {
      console.error(error);
    }
  }

  async setLocalDescription(sessionDescription) {
    try {
      // 自分のofferをセットする
      await this.rtcPeerConnection.setLocalDescription(sessionDescription);
    } catch (error) {
      console.error(error);
    }
  }

  async sendOffer() {
    this.firebaseSignallingClient.setPeerNames(
      this.localPeerName,
      this.remotePeerName
    );

    // offerをシグナリングサーバに送る
    await this.firebaseSignallingClient.sendOffer(this.localDescription);
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

  async answer(sender, sessionDescription) {
    try {
      // 誰と通信するか
      this.remotePeerName = sender;
      // コールバックの準備
      this.setOnicecandidateCallback();
      this.setOnTrack();
      // 通信相手のsdpをrtc connection オブジェクトに設定する
      await this.setRemoteDescription(sessionDescription);
      // answerを作成
      const answer = await this.rtcPeerConnection.createAnswer();
      this.rtcPeerConnection.setLocalDescription(answer);
      await this.sendAnswer();
    } catch (error) {
      console.error(error);
    }
  }

  async connect(remotePeerName) {
    this.remotePeerName = remotePeerName;
    this.setOnicecandidateCallback();
    this.setOnTrack();
    await this.offer();
    this.setRtcClient();
  }

  async setRemoteDescription(sessionDescription) {
    await this.rtcPeerConnection.setRemoteDescription(sessionDescription);
  }

  async sendAnswer() {
    this.firebaseSignallingClient.setPeerNames(
      this.localPeerName,
      this.remotePeerName
    );

    await this.firebaseSignallingClient.sendAnswer(this.localDescription);
  }

  get localDescription() {
    return this.rtcPeerConnection.localDescription.toJSON();
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
    this.firebaseSignallingClient.database
      .ref(name)
      .on("value", async (snapshot) => {
        const data = snapshot.val();
        if (data === null) {
          return;
        }
        console.log({ data });

        const { sender, sessionDescription, type } = data;

        switch (type) {
          case "offer":
            // answer
            await this.answer(sender, sessionDescription);
            break;
          default:
            break;
        }
      });
  }
}
