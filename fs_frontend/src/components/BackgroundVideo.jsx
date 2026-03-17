import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";

const BackgroundVideo = ({ src }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [prevSrc, setPrevSrc] = useState(null);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (src !== currentSrc) {
      setPrevSrc(currentSrc);
      setCurrentSrc(src);
      setIsChanging(true);
    }
  }, [src, currentSrc]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      {prevSrc && (
        <video
          key={prevSrc}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
          }}
        >
          <source src={prevSrc} type="video/mp4" />
        </video>
      )}

      <video
        key={currentSrc}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => {
          setTimeout(() => {
            setPrevSrc(null);
            setIsChanging(false);
          }, 500);
        }}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 2,
          opacity: isChanging ? 0 : 1,
          transition: "opacity 0.6s ease-in-out",
        }}
      >
        <source src={currentSrc} type="video/mp4" />
      </video>
    </Box>
  );
};

export default BackgroundVideo;