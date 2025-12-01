import { useEffect } from "react";
import { Keyboard, Animated, Platform } from "react-native";

export function useKeyboardOffset(animatedValue: Animated.Value) {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(animatedValue, {
        toValue: e.endCoordinates.height,
        duration: 200,
        useNativeDriver: false
      }).start();
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false
      }).start();
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
}
