import { ParamListBase, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";


type ScreenProps = NativeStackNavigationOptions | ((prop: {
  route: RouteProp<ParamListBase, string>;
  navigation: any;
}) => NativeStackNavigationOptions) | undefined


// Timeline Screen Configurations
export const TIMELINE_SCREENS = {
  TIMELINE: {
    name: "(7-Timeline)/7-Timeline",
    options: {
      headerShown: true,
      headerBackTitle: "Back",
      headerBackTitleStyle: {},
      headerTitle: "Timeline",
      headerLargeTitle: true,
    } as ScreenProps,
  },
  TIMELINE_DETAIL: {
    name: "(7-Timeline)/7-TimelineDetail",
    options: {
      headerShown: true,
      headerBackTitle: "Back",
      headerBackTitleStyle: {},
      headerTitle: "Timeline Detail",
      headerLargeTitle: true,
    } as ScreenProps,
  },

} as const;

// Main Tab Screen Configuration
export const MAIN_TAB_SCREEN = {
  name: "(tabs)",
  options: { headerShown: false },
} as const;

// Not Found Screen Configuration
export const NOT_FOUND_SCREEN = {
  name: "+not-found",
} as const;



export const TRANSITION_SCREENS = {
  TRANSITION: {
    name: "(8-transition)/8-Transition",
    options: {
      headerShown: true,
      headerBackTitle: "Back",
      headerBackTitleStyle: {},
      headerTitle: "Transition",
      headerLargeTitle: true,
    } as ScreenProps,
  },
} as const;