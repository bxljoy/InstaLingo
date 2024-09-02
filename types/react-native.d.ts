import { ViewProps, TextProps, ImageProps } from "react-native";

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
