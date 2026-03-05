import themeAppStore from "../store/appThemeStore";
const themes = {
    default: {
      name: "default",
      fieldsText: "#1d1300",
      primaryText: "#76520eff",
      secondaryText: "#a89879",
      primaryBack: "#c9a227",
      secondaryBack: "#fcf1c7",
      tertiaryBack: "#fffdf7",
      variantBack: "#dbb42cff",
      backgroundImage: "/background.png",
      links: "#c9a227",
    },
    dark: {
            name: "dark",

      fieldsText: "#d1d1d1",
      primaryText: "#fcf1c7", 
      secondaryText: "#c9a227", 
      primaryBack: "#1a1a1a", 
      secondaryBack: "#2d2d2d", 
      tertiaryBack: "#3d3d3d", 
      variantBack: "#76520e", 
      backgroundImage: "/dark-background.png",
      links: "#c9a227",
    },
    aquamarine: {
      name: "aquamarine",
      fieldsText: "#dbfff8",
      primaryText: "#b3fff0", 
      secondaryText: "#184e43", 
      primaryBack: "#257A69", 
      secondaryBack: "#0C2520", 
      tertiaryBack: "#194B41", 
      variantBack: "#2b7566", 
      backgroundImage: "/aquamarine-background.png",
      links: "#e1fff9",
    },
  };

export function useAppTheme() {
  const theme = themeAppStore((state) => state.theme);
  return themes[theme];
}

export default themes;
