import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useCSSVariable } from "uniwind";
import { useLocalSearchParams } from "expo-router";

type CalendarScreenProps = {
  embedded?: boolean;
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const buildCalendar = (month: Date) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - firstWeekday + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }
    return new Date(year, monthIndex, dayNumber);
  });
};

export default function CalendarScreen({ embedded = false }: CalendarScreenProps) {
  const router = useRouter();
  const { selectedDate: selectedDateParam } = useLocalSearchParams<{ selectedDate?: string }>();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const today = useMemo(() => new Date(), []);
  const primaryColor = useCSSVariable("--color-primary");
  const foregroundColor = useCSSVariable("--color-foreground");
  const mutedForeground = useCSSVariable("--color-muted-foreground");

  const monthLabel = useMemo(() => {
    return {
      month: MONTHS[visibleMonth.getMonth()],
      year: visibleMonth.getFullYear(),
    };
  }, [visibleMonth]);

  const calendarDays = useMemo(() => buildCalendar(visibleMonth), [visibleMonth]);
  const weeks = useMemo(
    () =>
      Array.from({ length: 6 }, (_, weekIndex) =>
        calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7)
      ),
    [calendarDays]
  );

  const goToMonth = (delta: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const goToToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const now = new Date();
    setVisibleMonth(startOfMonth(now));
    setSelectedDate(now);
    router.replace({
      pathname: "/(app)",
      params: { selectedDate: now.toISOString() },
    });
  };

  useEffect(() => {
    if (!selectedDateParam) return;
    const parsed = new Date(selectedDateParam);
    if (Number.isNaN(parsed.getTime())) return;
    setSelectedDate(parsed);
    setVisibleMonth(startOfMonth(parsed));
  }, [selectedDateParam]);

  return (
    <View className={'flex-1 px-6 pt-5'}>
      <View className="flex-row items-center justify-between">
        <Text className="text-3xl font-semibold text-foreground">
          {monthLabel.month}{" "}
          <Text className="text-muted-foreground">{monthLabel.year}</Text>
        </Text>
        <View className="flex-row items-center">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              goToMonth(-1);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="rounded-full p-2"
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={(mutedForeground as string) || "#B4B4B4"}
            />
          </Pressable>
          <Pressable onPress={goToToday} className="mx-2 px-2 py-1">
            <Text className="text-base font-semibold text-muted-foreground">Today</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              goToMonth(1);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="rounded-full p-2"
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={(mutedForeground as string) || "#B4B4B4"}
            />
          </Pressable>
        </View>
      </View>

      <View className="mt-6">
        <View className="flex-row">
          {WEEKDAYS.map((label, index) => (
            <Text
              key={`${label}-${index}`}
              className="flex-1 text-center text-xs font-semibold text-muted-foreground tracking-widest"
            >
              {label}
            </Text>
          ))}
        </View>

        <View className="mt-5">
          {weeks.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} className="mb-4 flex-row">
              {week.map((date, dayIndex) => {
                if (!date) {
                  return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.daySlot} />;
                }

                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, today);
                const dayColor = isSelected
                  ? "#FFFFFF"
                  : ((foregroundColor as string) || "#FAFAFA");

                return (
                  <View key={date.toISOString()} style={styles.daySlot}>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setSelectedDate(date);
                        router.replace({
                          pathname: "/(app)",
                          params: { selectedDate: date.toISOString() },
                        });
                      }}
                      style={[
                        styles.dayButton,
                        isSelected && {
                          backgroundColor: (primaryColor as string) || "#F97316",
                        },
                        !isSelected && isToday && styles.todayRing,
                      ]}
                    >
                      <Text style={[styles.dayText, { color: dayColor }]}>
                        {date.getDate()}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  daySlot: {
    flex: 1,
    alignItems: "center",
    height: 44,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 18,
    fontWeight: "600",
  },
  todayRing: {
    borderWidth: 1,
    borderColor: "rgba(180, 180, 180, 0.35)",
  },
});
