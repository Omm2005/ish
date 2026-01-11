import { Stack } from "expo-router";
import { isLiquidGlassAvailable } from "expo-glass-effect";

export default function AppLayout() {

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
      name="dash" 
      options={{
        presentation: "modal",
        animation: "slide_from_bottom",

      }}
      />
      <Stack.Screen
      name="calendar"
      options={{
        presentation: "formSheet",
        animation: "slide_from_bottom",
        sheetGrabberVisible: true,
        // sheetAllowedDetents: [0.6, 0.6, 0.6],
        sheetAllowedDetents: "fitToContents",
        sheetInitialDetentIndex: 0,
        sheetLargestUndimmedDetentIndex: 0,
        contentStyle: isLiquidGlassAvailable() ? { backgroundColor: "transparent" } : {},
      }}
      />
      <Stack.Screen 
      name="index" 
      />
      <Stack.Screen 
      name="profile" 
      options={{
        presentation: "modal",
        animation: "slide_from_bottom",
      }}
      />
    </Stack>
  );
}
