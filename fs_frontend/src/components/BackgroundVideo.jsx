import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";

const BackgroundVideo = ({ src }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [prevSrc, setPrevSrc] = useState(null);

  // IMPORTANTE: Empezamos en TRUE para que el video nuevo esté invisible
  // hasta que onLoadedData nos diga que hay imagen.
  const [isChanging, setIsChanging] = useState(true);

  useEffect(() => {
    if (src !== currentSrc) {
      setPrevSrc(currentSrc);
      setCurrentSrc(src);
      setIsChanging(true); // Bloqueamos la opacidad al cambiar de src
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
      {/* Video de respaldo (el anterior) */}
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

      {/* Video principal */}
      <video
        key={currentSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={() => {
          setIsChanging(false);
          if (prevSrc) {
            setTimeout(() => setPrevSrc(null), 600);
          }
        }}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 2,
          opacity: isChanging ? 0 : 1,
          transition: "opacity 0.4s ease-in-out",
        }}
      >
        <source src={currentSrc} type="video/mp4" />
      </video>
    </Box>
  );
};

export default BackgroundVideo;
