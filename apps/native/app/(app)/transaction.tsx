import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCSSVariable } from "uniwind";
import * as Haptics from "expo-haptics";

type TransactionPayload = {
  id: string;
  title: string;
  amount: string;
  currency: string;
  type: "income" | "expense";
  category?: string | null;
  note?: string | null;
  occurredAt?: string | null;
};

export default function TransactionSheet() {
  const router = useRouter();
  const { data } = useLocalSearchParams<{ data?: string }>();
  const muted = useCSSVariable("--color-muted-foreground");
  const foreground = useCSSVariable("--color-foreground");

  const tx = useMemo<TransactionPayload | null>(() => {
    if (!data) return null;
    try {
      return JSON.parse(decodeURIComponent(String(data)));
    } catch {
      return null;
    }
  }, [data]);

  if (!tx) {
    return (
      <View className="px-6 pt-6" style={{ backgroundColor: "transparent" }}>
        <Text className="text-base text-muted-foreground">
          Transaction not found.
        </Text>
      </View>
    );
  }

  const dateLabel = tx.occurredAt
    ? new Date(tx.occurredAt).toLocaleString()
    : "Not specified";
  const isExpense = tx.type === "expense";
  const amountValue = Number(tx.amount);
  const amountLabel = Number.isFinite(amountValue)
    ? amountValue.toFixed(2)
    : tx.amount;
  const currencyLabel = tx.currency === "USD" ? "$" : tx.currency;
  const amountColor = isExpense ? "#ef4444" : "#22c55e";

  return (
    <View className="px-6 pt-6 pb-10" style={{ backgroundColor: "transparent" }}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-2xl font-semibold text-foreground">
            {tx.title}
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            {tx.category ?? "Uncategorized"}
            {tx.occurredAt ? ` · ${dateLabel}` : ""}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <Ionicons name="close" size={18} color={foreground as string} />
        </Pressable>
      </View>

      <Text className="mt-6 text-3xl font-semibold" style={{ color: amountColor }}>
        {currencyLabel} {amountLabel}
      </Text>

      {tx.note ? (
        <View className="mt-6">
          <Text className="text-xs font-semibold text-muted-foreground">NOTE</Text>
          <Text className="mt-1 text-base text-foreground">{tx.note}</Text>
        </View>
      ) : null}

      <View className="mt-6 h-px w-full bg-white/10" />

      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-xs font-semibold text-muted-foreground">TYPE</Text>
        <Text className="text-sm text-foreground">{tx.type}</Text>
      </View>
    </View>
  );
}
