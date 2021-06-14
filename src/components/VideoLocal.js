import React, { useEffect, useRef } from "react";

const VideoLocal = () => {
  const videoRef = useRef(null);
  const currentVideoRef = videoRef.current;

  useEffect(() => {
    if (currentVideoRef === null) {
      return;
    }

    const getMedia = async () => {
      const constraints = { audio: true, video: true };
      try {
        // ブラウザで許可を求める通知が出る
        const mediaStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );

        currentVideoRef.srcObject = mediaStream;
      } catch (err) {
        console.error(err);
      }
    };

    getMedia();
  }, [currentVideoRef]);

  return <></>;
};

export default VideoLocal;
