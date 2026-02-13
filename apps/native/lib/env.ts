import Constants from "expo-constants";

type Extra = Record<string, unknown> | undefined;

const extra: Extra =
  Constants.expoConfig?.extra ??
  // Constants.manifest is deprecated, but still present in some runtimes.
  (Constants as unknown as { manifest?: { extra?: Extra } }).manifest?.extra;

const fromProcess = process.env.EXPO_PUBLIC_SERVER_URL;
const fromExtra =
  (extra?.EXPO_PUBLIC_SERVER_URL as string | undefined) ??
  (extra?.serverUrl as string | undefined);

const EXPO_PUBLIC_SERVER_URL = fromProcess ?? fromExtra;

if (!EXPO_PUBLIC_SERVER_URL) {
  throw new Error(
    "EXPO_PUBLIC_SERVER_URL is not set. Add it to apps/native/.env or apps/native/app.json extra.",
  );
}

export const env = {
  EXPO_PUBLIC_SERVER_URL,
};
