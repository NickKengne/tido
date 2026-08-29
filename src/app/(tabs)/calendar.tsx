import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { GlassView } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { EventCard } from "@/components/calendar/event-card";
import { EventFormSheet } from "@/components/calendar/event-form-sheet";
import { EventStack } from "@/components/calendar/event-stack";
import { WeekStrip, type WeekDay } from "@/components/calendar/week-strip";
import type { CalendarEvent } from "@/data/calendar-events";
import { haptics } from "@/lib/haptics";
import { useCalendarStore } from "@/store/calendar-store";
import { useSettingsStore, type WeekStart } from "@/store/settings-store";

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

function formatHour(hour: number) {
  const twelveHour = hour % 12 === 0 ? 12 : hour % 12;
  const label = twelveHour < 10 ? `0${twelveHour}` : `${twelveHour}`;
  return `${label} ${hour < 12 ? "AM" : "PM"}`;
}

function startOfWeek(date: Date, weekStartsOn: WeekStart) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = weekStartsOn === "sunday" ? -day : (day === 0 ? -6 : 1) - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function buildWeek(weekStart: Date): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return {
      date,
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
      day: date.getDate(),
    };
  });
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const events = useCalendarStore((s) => s.events);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);
  const weekStartsOn = useSettingsStore((s) => s.weekStartsOn);
  const formSheetRef = useRef<BottomSheetModal>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formToken, setFormToken] = useState(0);

  const openCreateSheet = () => {
    setEditingEvent(null);
    setFormToken((t) => t + 1);
    formSheetRef.current?.present();
  };

  const openEditSheet = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormToken((t) => t + 1);
    formSheetRef.current?.present();
  };

  const confirmDelete = (event: CalendarEvent) => {
    haptics.impact(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete event?",
      `"${event.title}" will be removed from your calendar.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteEvent(event.id),
        },
      ],
    );
  };

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const weekStart = useMemo(
    () => startOfWeek(selectedDate, weekStartsOn),
    [selectedDate, weekStartsOn],
  );
  const weekDays = useMemo(() => buildWeek(weekStart), [weekStart]);
  const selectedIndex = Math.max(
    0,
    weekDays.findIndex(
      (d) => d.date.toDateString() === selectedDate.toDateString(),
    ),
  );

  const monthLabel = selectedDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  // Events only carry a `dayOffset` from today, so resolve them against
  // whichever day is selected and bucket the ones that land on it by hour —
  // an hour can hold several, which is what EventStack is for.
  const eventsByHour = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (const event of events) {
      const eventDate = new Date(base);
      eventDate.setDate(eventDate.getDate() + event.dayOffset);
      if (eventDate.toDateString() !== selectedDate.toDateString()) continue;
      const bucket = map.get(event.hour) ?? [];
      bucket.push(event);
      map.set(event.hour, bucket);
    }
    return map;
  }, [events, selectedDate]);

  // With a full 24-hour list, jumping straight to midnight would hide
  // everything relevant below the fold — scroll to today's current hour
  // (or the day's first event otherwise) once row positions are known.
  const scrollRef = useRef<ScrollView>(null);
  const rowOffsets = useRef<Map<number, number>>(new Map());
  const hasScrolledRef = useRef(false);

  const selectedDateKey = selectedDate.toDateString();
  useEffect(() => {
    hasScrolledRef.current = false;
  }, [selectedDateKey]);

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const firstEventHour =
    Array.from(eventsByHour.keys()).sort((a, b) => a - b)[0] ?? 8;
  const targetHour = isToday ? new Date().getHours() : firstEventHour;

  const scrollToTargetHour = () => {
    if (hasScrolledRef.current) return;
    const y = rowOffsets.current.get(targetHour);
    if (y === undefined) return;
    hasScrolledRef.current = true;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: false });
  };

  const shiftWeek = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta * 7);
    setSelectedDate(next);
  };

  return (
    <View
      style={[styles.container, Platform.OS === "web" && styles.containerWeb]}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <View style={styles.navRow}>
            <Pressable
              hitSlop={10}
              onPress={() => shiftWeek(-1)}
              style={({ pressed }) => [
                styles.navButton,
                pressed && styles.navButtonPressed,
              ]}
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={22}
                color="#B7B9C2"
                strokeWidth={2}
              />
            </Pressable>
            <Pressable
              hitSlop={10}
              onPress={() => shiftWeek(1)}
              style={({ pressed }) => [
                styles.navButton,
                pressed && styles.navButtonPressed,
              ]}
            >
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={22}
                color="#17171B"
                strokeWidth={2}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.weekStripWrap}>
          <WeekStrip
            days={weekDays}
            selectedIndex={selectedIndex}
            onSelect={(index) => setSelectedDate(weekDays[index].date)}
          />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.timeline}
          showsVerticalScrollIndicator={false}
        >
          {HOURS.map((hour, index) => {
            const isLast = index === HOURS.length - 1;
            const events = eventsByHour.get(hour) ?? [];

            return (
              <View
                key={hour}
                style={styles.row}
                onLayout={(e) => {
                  rowOffsets.current.set(hour, e.nativeEvent.layout.y);
                  if (hour === targetHour) scrollToTargetHour();
                }}
              >
                <Text style={styles.hourLabel}>{formatHour(hour)}</Text>
                {!isLast ? (
                  <View style={styles.rowContent}>
                    {events.length > 1 ? (
                      <EventStack
                        events={events}
                        onPressEvent={openEditSheet}
                        onLongPressEvent={confirmDelete}
                      />
                    ) : events.length === 1 ? (
                      <EventCard
                        title={events[0].title}
                        subtitle={events[0].subtitle}
                        time={events[0].time}
                        backgroundColor={events[0].backgroundColor}
                        avatars={events[0].avatars}
                        onPress={() => openEditSheet(events[0])}
                        onLongPress={() => confirmDelete(events[0])}
                      />
                    ) : (
                      <View style={styles.divider} />
                    )}
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>

        {/* `style` must stay a plain array here, not a `({ pressed }) => [...]`
            callback — under this project's nativewind jsxImportSource that
            callback form silently drops `position: 'absolute'` on native, so
            the button rendered in normal flow and got squeezed to nothing
            behind the flex:1 ScrollView. Pressed feedback goes on the inner
            child instead (same fix as day-pill.tsx). */}
        <Pressable
          hitSlop={8}
          onPress={openCreateSheet}
          style={[
            styles.fab,
            { bottom: Math.max(insets.bottom, 20) + 8 + 60 + 16 },
          ]}
        >
          {({ pressed }) => (
            <GlassView
              glassEffectStyle={{ style: "clear", animate: true }}
              tintColor="#fff"
              isInteractive
              style={[fabGlassStyle, pressed && styles.fabPressed]}
            >
              <HugeiconsIcon
                icon={Add01Icon}
                size={26}
                color="#000"
                strokeWidth={2}
              />
            </GlassView>
          )}
        </Pressable>
      </SafeAreaView>

      <EventFormSheet
        ref={formSheetRef}
        selectedDate={selectedDate}
        event={editingEvent}
        openToken={formToken}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFC",
  },
  containerWeb: {
    position: "fixed" as "relative",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  // Padding lives on the header/weekstrip/timeline content, not on safeArea
  // itself — safeArea padding would shrink the ScrollView's own frame, and a
  // ScrollView clips anything (a badge, a dragged card) that renders past its
  // frame edge. Keeping the frame full-width gives that content room to
  // escape into before it would actually get clipped.
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingHorizontal: 25,
  },
  monthLabel: {
    fontSize: 26,
    fontFamily: "Saans-SemiBold",
    color: "#17171B",
  },
  navRow: {
    flexDirection: "row",
    gap: 8,
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.92 }],
  },
  weekStripWrap: {
    marginTop: 24,
    paddingHorizontal: 25,
  },
  scroll: {
    flex: 1,
  },
  timeline: {
    marginTop: 28,
    paddingBottom: 140,
    paddingHorizontal: 25,
  },
  row: {
    flexDirection: "row",
  },
  hourLabel: {
    width: 46,
    fontSize: 13,
    fontFamily: "Saans-Medium",
    color: "#9A9CA5",
    paddingTop: 2,
  },
  rowContent: {
    flex: 1,
    marginLeft: 14,
    paddingBottom: 28,
  },
  divider: {
    height: 1,
    backgroundColor: "#EAEAEF",
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    right: 25,
    width: 52,
    height: 52,
    borderRadius: 26,
    shadowColor: "#17171B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
});

// GlassView falls back to a plain (transparent) View on platforms other than
// iOS 26+, so it needs an opaque fallback color there (mirrors day-pill.tsx).
const fabGlassStyle = StyleSheet.flatten([
  {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    overflow: "hidden" as const,
  },
  Platform.OS !== "ios" && { backgroundColor: "#17171B" },
]);
