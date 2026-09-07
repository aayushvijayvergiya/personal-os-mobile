/* global jest */

// The Supabase client is constructed at module load and refuses to start without these.
process.env.EXPO_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.EXPO_PUBLIC_ALLOW_SIGNUP = "false";

// Native modules with no JS implementation under Jest.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("@react-native-community/datetimepicker", () => {
  const React = require("react");
  const { View } = require("react-native");
  const MockPicker = (props) => React.createElement(View, { testID: "datetimepicker", ...props });
  const DateTimePickerAndroid = { open: jest.fn(), dismiss: jest.fn() };
  return { __esModule: true, default: MockPicker, DateTimePickerAndroid };
});

jest.mock("@expo-google-fonts/ibm-plex-sans", () => ({
  __esModule: true,
  useFonts: () => [true, null],
  IBMPlexSans_400Regular: "IBMPlexSans_400Regular",
  IBMPlexSans_600SemiBold: "IBMPlexSans_600SemiBold",
}));
