import themeAppStore from "../store/appThemeStore";
const themes = {
  default: {
    name: "default",
    navBar: {
      textColor: "#c9a227",
      backColor: "#fffdf7",
    },
    fieldsText: "#1d1300",
    primaryText: "#76520eff",
    secondaryText: "#a89879",
    variantText: "#ffffff",
    primaryBack: "#c9a227",
    secondaryBack: "#fcf1c7",
    tertiaryBack: "#fffdf7",
    variantBack: "#dbb42cff",
    backgroundImage: "/background.png",
    buttonHover: "#c9a227",
    links: "#c9a227",
  },
  dark: {
    name: "dark",
    navBar: {
      textColor: "#fcf1c7",
      backColor: "#2d2d2d",
    },
    fieldsText: "#d1d1d1",
    primaryText: "#fcf1c7",
    secondaryText: "#c9a227",
    variantText: "#ffffff",
    primaryBack: "#1a1a1a",
    secondaryBack: "#2d2d2d",
    tertiaryBack: "#3d3d3d",
    variantBack: "#76520e",
    backgroundImage: "/dark-background.png",
    buttonHover: "#c9a227",

    links: "#c9a227",
  },

  radiactivity: {
    name: "dark",
    navBar: {
      textColor: "#84ff00",
      backColor: "#2d2d2d",
    },
    fieldsText: "#84ff00",
    primaryText: "#84ff00",
    secondaryText: "#84ff00",
    variantText: "#84ff00",
    primaryBack: "#1a1a1a",
    secondaryBack: "#2d2d2d",
    tertiaryBack: "#3d3d3d",
    variantBack: "#000000",
    backgroundImage: "/dark-background.png",
    buttonHover: "#4fc927",

    links: "#52c927",
  },

  aquamarine: {
    name: "aquamarine",
    navBar: {
      textColor: "#b3fff0",
      backColor: "#12372f",
    },
    fieldsText: "#dbfff8",
    primaryText: "#b3fff0",
    secondaryText: "#8ce8d5",
    variantText: "#ffffff",
    primaryBack: "#257A69",
    secondaryBack: "#12372f",
    tertiaryBack: "#194B41",
    variantBack: "#2b7566",
    backgroundImage: "/aquamarine-background.png",
    buttonHover: "#3ab69d",
    links: "#e1fff9",
  },
};

export function useAppTheme() {
  const theme = themeAppStore((state) => state.theme);
  return themes[theme];
}

export default themes;
