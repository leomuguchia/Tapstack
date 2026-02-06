import { useEffect, useState, useRef } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";

export default function useAppInit(customInit) {
  const [isReady, setIsReady] = useState(false);
  const didInitRef = useRef(false);
  const fallbackTimeoutRef = useRef(null);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    let isMounted = true;

    const init = async () => {
      try {
        await Font.loadAsync({
          "jakarta-bold": require("../assets/fonts/jakarta-bold.ttf"),
          "jakarta-medium": require("../assets/fonts/jakarta-medium.ttf"),
          "jakarta-regular": require("../assets/fonts/jakarta-regular.ttf"),
        });

        if (customInit && typeof customInit === "function") {
          await customInit();
        }

        if (!isMounted) return;

        setIsReady(true);
        await SplashScreen.hideAsync();

        if (fallbackTimeoutRef.current) {
          clearTimeout(fallbackTimeoutRef.current);
          fallbackTimeoutRef.current = null;
        }
      } catch (error) {
        if (!isMounted) return;
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    init();

    fallbackTimeoutRef.current = setTimeout(async () => {
      if (!isMounted) return;
      setIsReady(true);
      await SplashScreen.hideAsync();
    }, 10000);

    return () => {
      isMounted = false;
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
    };
  }, [customInit]);

  return { isReady };
}
