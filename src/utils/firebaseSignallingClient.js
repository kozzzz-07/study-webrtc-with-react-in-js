import firebase from "firebase/app";
import "firebase/database";

export default class FirebaseSignallingClient {
  constructor() {
    const firebaseConfig = {
      apiKey: "AIzaSyALq9I2jRc6zm2vesmYf-HNls5sp9dxr9I",
      authDomain: "study-webrtc-b0268.firebaseapp.com",
      databaseURL: "https://study-webrtc-b0268-default-rtdb.firebaseio.com",
      projectId: "study-webrtc-b0268",
      storageBucket: "study-webrtc-b0268.appspot.com",
      messagingSenderId: "29073799097",
      appId: "1:29073799097:web:2986df2795741bcc6d2868",
      measurementId: "G-MM583T7ZPF",
    };
    if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig);
    // firebase.analytics();
    this.database = firebase.database();
    this.localPeerName = "";
    this.remotePeerName = "";
  }

  setPeerNames(localPeerName, remotePeerName) {
    this.localPeerName = localPeerName;
    this.remotePeerName = remotePeerName;
  }

  get targetRef() {
    return this.database.ref(this.remotePeerName);
  }

  async sendOffer(sessionDescription) {
    await this.targetRef.set({
      type: "offer",
      sender: this.localPeerName,
      sessionDescription,
    });
  }

  async sendAnswer(sessionDescription) {
    await this.targetRef.set({
      type: "answer",
      sender: this.localPeerName,
      sessionDescription,
    });
  }

  async remove(path) {
    await this.database.ref(path).remove();
  }
}
