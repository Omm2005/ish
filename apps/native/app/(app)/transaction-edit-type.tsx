import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCSSVariable } from "uniwind";
import * as Haptics from "expo-haptics";
import { authClient } from "@/lib/auth-client";
import { env } from "@/lib/env";
import {
  buildUpdatePayload,
  parseTxParam,
  publishTxUpdate,
  TransactionPayload,
} from "./transaction-edit-shared";

export default function TransactionEditTypeScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams<{ data?: string }>();
  const foreground = useCSSVariable("--color-foreground");
  const tx = useMemo(() => parseTxParam(data), [data]);
  const [value, setValue] = useState<"income" | "expense">(
    tx?.type ?? "expense"
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!tx) {
    return (
      <View className="px-6 pt-6">
        <Text className="text-base text-muted-foreground">
          Transaction not found.
        </Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const nextTx: TransactionPayload = { ...tx, type: value };
      const cookie = authClient.getCookie?.() ?? "";
      const res = await fetch(
        `${env.EXPO_PUBLIC_SERVER_URL}/transactions/${tx.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", cookie },
          body: JSON.stringify(buildUpdatePayload(nextTx)),
        }
      );
      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
      publishTxUpdate(nextTx);
      router.back();
    } catch (error) {
      console.log("Failed to update type", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-transparent px-6 pt-6">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-foreground">Edit type</Text>
        <Pressable
          onPress={() => router.back()}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <Ionicons name="close" size={18} color={foreground as string} />
        </Pressable>
      </View>

      <View className="mt-8 rounded-2xl border border-border/40 px-2">
        <Picker
          selectedValue={value}
          onValueChange={(v) => setValue(v)}
          style={{ color: foreground as string }}
        >
          <Picker.Item label="Expense" value="expense" />
          <Picker.Item label="Income" value="income" />
        </Picker>
      </View>

      <Pressable
        onPress={handleSave}
        disabled={isSaving}
        className={`mt-8 h-12 items-center justify-center rounded-full bg-foreground ${
          isSaving ? "opacity-60" : ""
        }`}
      >
        <Text className="text-base font-semibold text-background-primary">
          {isSaving ? "Saving..." : "Save"}
        </Text>
      </Pressable>
    </View>
  );
}
