import themeAppStore from "../store/appThemeStore";
const themes = {
  default: {
    name: "default",
    navBar: {
      textColor: "#c9a227",
      backColor: "#fffdf7",
      whiteSpace: "#c5a34b",
    },
    fieldsText: "#1d1300",
    primaryText: "#76520eff",
    secondaryText: "#a89879",
    variantText: "#ffffff",
    primaryBack: "#c9a227",
    secondaryBack: "#fcf1c7",
    tertiaryBack: "#fffdf7",
    variantBack: "#dbb42cff",
    // backgroundImage: "/background.png",
    backgroundVideo: "/background-video.mp4",
    initialPoster: "/background-poster.jpg",
    buttonHover: "#c9a227",
    hoveredRow: "#ededed",

    links: "#c9a227",
  },
  dark: {
    name: "dark",
    navBar: {
      textColor: "#fcf1c7",
      backColor: "#2d2d2d",
      whiteSpace: "#242424",
    },
    fieldsText: "#d1d1d1",
    primaryText: "#fcf1c7",
    secondaryText: "#c9a227",
    variantText: "#ffffff",
    primaryBack: "#1a1a1a",
    secondaryBack: "#2d2d2d",
    tertiaryBack: "#3d3d3d",
    variantBack: "#76520e",
    // backgroundImage: "/dark-background.png",
    backgroundVideo: "/dark-background-video.mp4",
    initialPoster: "/dark-background-poster.jpg",
    buttonHover: "#c9a227",
    hoveredRow: "#5f4d12",
    links: "#c9a227",
  },

  reformated: {
    name: "default",
    navBar: {
      textColor: "#c9a227",
      backColor: "#fffdf7",
      whiteSpace: "#c5a34b",
    },
    fieldsText: "#1d1300",
    primaryText: "#76520eff",
    secondaryText: "#a89879",
    variantText: "#ffffff",
    primaryBack: "#c9a227",
    secondaryBack: "#fcf1c7",
    tertiaryBack: "#fffdf7",
    variantBack: "#dbb42cff",
    // backgroundImage: "/background.png",
    backgroundVideo: "/background-video.mp4",
    initialPoster: "/background-poster.jpg",
    buttonHover: "#c9a227",
    hoveredRow: "#ededed",

    links: "#c9a227",
  },
};

export function useAppTheme() {
  const theme = themeAppStore((state) => state.theme);
  return themes[theme];
}

export default themes;
