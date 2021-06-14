import React from "react";

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
  return (
    <>
      <InputFormLocal />
      <InputFormRemote />
    </>
  );
};

export default App;
