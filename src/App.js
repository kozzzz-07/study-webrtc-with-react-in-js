import React from "react";

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
  return <div>Hello, React!</div>;
};

export default App;
