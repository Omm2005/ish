import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
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

export default function TransactionEditDateScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams<{ data?: string }>();
  const foreground = useCSSVariable("--color-foreground");
  const tx = useMemo(() => parseTxParam(data), [data]);
  const [value, setValue] = useState(
    tx?.occurredAt ? new Date(tx.occurredAt) : new Date()
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
      const nextTx: TransactionPayload = {
        ...tx,
        occurredAt: value.toISOString(),
      };
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
      console.log("Failed to update date", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-transparent px-6 pt-6">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-foreground">Edit date</Text>
        <Pressable
          onPress={() => router.back()}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <Ionicons name="close" size={18} color={foreground as string} />
        </Pressable>
      </View>

      <View className="mt-6">
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_event, selected) => {
            if (selected) setValue(selected);
          }}
        />
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
