const Video = ({ isLocal, name, videoRef }) => {
  return (
    <div>
      <video autoPlay muted={isLocal} ref={videoRef} />
      <div>{name}</div>
    </div>
  );
};

export default Video;
