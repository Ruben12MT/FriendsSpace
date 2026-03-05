import themeAppStore from "../store/appThemeStore";
const themes = {
    light: {
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
  };

export function useAppTheme() {
  const theme = themeAppStore((state) => state.theme);
  return themes[theme];
}

export default themes;
