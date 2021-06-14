import React, { useState } from "react";

import InputFormLocal from "./InputFormLocal";
import InputFormRemote from "./InputFormRemote";

const getMedia = async () => {
  const constraints = { audio: true, video: true };
  try {
    // ブラウザで許可を求める通知が出る
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    console.error(err);
  }
};

getMedia();

const App = () => {
  const [localPeerName, setLocalPeerName] = useState("");
  const [remotePeerName, setRemotePeerName] = useState("");

  return (
    <>
      <InputFormLocal
        localPeerName={localPeerName}
        setLocalPeerName={setLocalPeerName}
      />
      <InputFormRemote
        remotePeerName={remotePeerName}
        setRemotePeerName={setRemotePeerName}
      />
    </>
  );
};

export default App;
