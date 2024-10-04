import { ViewProps, TextProps, ImageProps } from "react-native";
import { LottieViewProps } from "lottie-react-native";

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface ButtonProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  // Add more components as needed.
}

declare module "lottie-react-native" {
  interface LottieViewProps {
    className?: string;
  }
}
