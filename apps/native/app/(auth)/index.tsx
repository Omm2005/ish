import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function AuthScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(auth)/onboarding");
  }, [router]);

  return null;
}
