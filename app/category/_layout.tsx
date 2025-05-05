import { Stack } from "expo-router";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function CategoryLayout() {
  const theme = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerBackTitle: "", // This removes the (tabs) text
        headerTitle: "", // This removes 'category' from the header
        headerShadowVisible: false,
      }}
    >
      {/* Define the index route explicitly */}
      <Stack.Screen name="index" />
      {/* Define the dynamic [id] route explicitly */}
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
