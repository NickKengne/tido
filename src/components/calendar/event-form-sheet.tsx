import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { type CalendarEvent, clockLabel, COLORS } from "@/data/calendar-events";
import { TEAM_MEMBERS } from "@/data/team";
import { useCalendarStore } from "@/store/calendar-store";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DURATIONS = [1, 2, 3];
const DEFAULT_HOUR = 9;
const DATE_RANGE_BEFORE = 3;
const DATE_RANGE_AFTER = 21;
const DEFAULT_PEOPLE = [TEAM_MEMBERS[0].id, TEAM_MEMBERS[1].id];

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function dateChipLabel(date: Date, today: Date) {
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

type EventFormSheetProps = {
  // Whatever day is showing on the calendar — the default for a new event.
  selectedDate: Date;
  // The event being edited, or null when the sheet is creating a new one.
  event: CalendarEvent | null;
  // Bumped by the parent every time it presents the sheet, so the form
  // re-derives its fields from `event`/`selectedDate` on every open — not
  // just the first time either of those happens to change identity.
  openToken: number;
};

export const EventFormSheet = forwardRef<BottomSheetModal, EventFormSheetProps>(
  function EventFormSheet({ selectedDate, event, openToken }, ref) {
    const sheetRef = useRef<BottomSheetModal>(null);
    useImperativeHandle(ref, () => sheetRef.current as BottomSheetModal, []);

    const addEvent = useCalendarStore((s) => s.addEvent);
    const updateEvent = useCalendarStore((s) => s.updateEvent);

    const isEditing = event !== null;

    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [date, setDate] = useState(() => startOfDay(selectedDate));
    const [hour, setHour] = useState(DEFAULT_HOUR);
    const [duration, setDuration] = useState(1);
    const [colorIndex, setColorIndex] = useState(0);
    const [peopleIds, setPeopleIds] = useState<string[]>(DEFAULT_PEOPLE);

    const today = useMemo(() => startOfDay(new Date()), []);

    // Re-derive every field from scratch each time the sheet is opened
    // (`openToken` changes on every `.present()`), rather than reacting to
    // `event`/`selectedDate` identity — otherwise reopening the sheet for the
    // same event after an unsaved, cancelled edit would show stale values.
    useEffect(() => {
      if (event) {
        const eventDate = new Date(today);
        eventDate.setDate(eventDate.getDate() + event.dayOffset);
        setTitle(event.title);
        setSubtitle(event.subtitle);
        setDate(eventDate);
        setHour(event.hour);
        setDuration(event.durationHours);
        const colorMatch = COLORS.indexOf(event.backgroundColor);
        setColorIndex(colorMatch >= 0 ? colorMatch : 0);
        setPeopleIds(
          TEAM_MEMBERS.filter((m) =>
            event.avatars.some((a) => a.uri === m.avatar.uri),
          ).map((m) => m.id),
        );
      } else {
        setTitle("");
        setSubtitle("");
        setDate(startOfDay(selectedDate));
        setHour(DEFAULT_HOUR);
        setDuration(1);
        setColorIndex(0);
        setPeopleIds(DEFAULT_PEOPLE);
      }
      // Deliberately keyed on `openToken` alone — see the comment above.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openToken]);

    const dateOptions = useMemo(
      () =>
        Array.from({ length: DATE_RANGE_BEFORE + DATE_RANGE_AFTER + 1 }, (_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() + i - DATE_RANGE_BEFORE);
          return d;
        }),
      [today],
    );

    const canSubmit = title.trim().length > 0;

    const togglePerson = (id: string) => {
      setPeopleIds((current) =>
        current.includes(id) ? current.filter((p) => p !== id) : [...current, id],
      );
    };

    const handleSubmit = () => {
      if (!canSubmit) return;

      // Store dayOffset (not an absolute date) to match the seed data —
      // resolved against "today" wherever it's read, same as calendar.tsx.
      const dayOffset = Math.round((date.getTime() - today.getTime()) / 86_400_000);

      const payload = {
        dayOffset,
        hour,
        durationHours: duration,
        title: title.trim(),
        subtitle: subtitle.trim() || "Personal",
        time: `${clockLabel(hour)} - ${clockLabel(hour + duration)}`,
        backgroundColor: COLORS[colorIndex],
        avatars: TEAM_MEMBERS.filter((m) => peopleIds.includes(m.id)).map((m) => m.avatar),
      };

      if (event) {
        updateEvent(event.id, payload);
      } else {
        addEvent(payload);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      sheetRef.current?.dismiss();
    };

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.content}>
          <Text style={styles.heading}>{isEditing ? "Edit event" : "New event"}</Text>
          <Text style={styles.dateLabel}>
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </Text>

          <BottomSheetTextInput
            style={styles.input}
            placeholder="Event title"
            placeholderTextColor="#A6A8B0"
            value={title}
            onChangeText={setTitle}
          />
          <BottomSheetTextInput
            style={styles.input}
            placeholder="Project or note (optional)"
            placeholderTextColor="#A6A8B0"
            value={subtitle}
            onChangeText={setSubtitle}
          />

          <Text style={styles.sectionLabel}>Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {dateOptions.map((d) => {
              const selected = d.getTime() === date.getTime();
              return (
                <Pressable
                  key={d.toISOString()}
                  onPress={() => setDate(d)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {dateChipLabel(d, today)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionLabel}>Start time</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {HOURS.map((h) => (
              <Pressable
                key={h}
                onPress={() => setHour(h)}
                style={[styles.chip, h === hour && styles.chipSelected]}
              >
                <Text style={[styles.chipText, h === hour && styles.chipTextSelected]}>
                  {clockLabel(h)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.sectionLabel}>Duration</Text>
          <View style={styles.chipRow}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d}
                onPress={() => setDuration(d)}
                style={[styles.chip, d === duration && styles.chipSelected]}
              >
                <Text style={[styles.chipText, d === duration && styles.chipTextSelected]}>
                  {d}h
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>People</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.peopleRow}
          >
            {TEAM_MEMBERS.map((member) => {
              const selected = peopleIds.includes(member.id);
              return (
                <Pressable
                  key={member.id}
                  onPress={() => togglePerson(member.id)}
                  style={styles.personColumn}
                >
                  <View style={[styles.personAvatarRing, selected && styles.personAvatarRingSelected]}>
                    <Image
                      source={{ uri: member.avatar.uri }}
                      style={styles.personAvatar}
                      contentFit="cover"
                    />
                    {selected ? (
                      <View style={styles.personCheck}>
                        <Text style={styles.personCheckText}>✓</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.personName} numberOfLines={1}>
                    {member.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionLabel}>Color</Text>
          <View style={styles.swatchRow}>
            {COLORS.map((color, index) => (
              <Pressable
                key={color}
                onPress={() => setColorIndex(index)}
                style={[
                  styles.swatch,
                  { backgroundColor: color },
                  index === colorIndex && styles.swatchSelected,
                ]}
              />
            ))}
          </View>

          {/* `style` stays a plain array, not a `({ pressed }) => [...]`
              callback — that form silently drops styling on native under this
              project's nativewind setup (see calendar.tsx / day-pill.tsx).
              Pressed feedback goes on the inner child instead. */}
          <Pressable onPress={handleSubmit} disabled={!canSubmit} style={styles.submit}>
            {({ pressed }) => (
              <View
                style={[
                  styles.submitInner,
                  !canSubmit && styles.submitDisabled,
                  pressed && canSubmit && styles.submitPressed,
                ]}
              >
                <Text style={styles.submitText}>
                  {isEditing ? "Save changes" : "Add event"}
                </Text>
              </View>
            )}
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#FAFAFC",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handleIndicator: {
    backgroundColor: "#E0E0E6",
    width: 40,
  },
  content: {
    paddingHorizontal: 25,
    paddingTop: 4,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontFamily: "Saans-SemiBold",
    color: "#17171B",
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: "Saans-Medium",
    color: "#9A9CA5",
    marginTop: 2,
  },
  input: {
    marginTop: 18,
    height: 50,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F0F0F3",
    fontSize: 15,
    fontFamily: "Saans-Medium",
    color: "#17171B",
  },
  sectionLabel: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 13,
    fontFamily: "Saans-SemiBold",
    color: "#17171B",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F0F0F3",
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: "#17171B",
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Saans-Medium",
    color: "#17171B",
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  peopleRow: {
    flexDirection: "row",
    gap: 16,
  },
  personColumn: {
    alignItems: "center",
    width: 56,
  },
  personAvatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  personAvatarRingSelected: {
    borderColor: "#17171B",
  },
  personAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    backgroundColor: "#F0F0F3",
  },
  personCheck: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#17171B",
    borderWidth: 2,
    borderColor: "#FAFAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  personCheckText: {
    fontSize: 9,
    fontFamily: "Saans-SemiBold",
    color: "#ffffff",
  },
  personName: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: "Saans-Medium",
    color: "#17171B",
    textAlign: "center",
  },
  swatchRow: {
    flexDirection: "row",
    gap: 12,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: "#17171B",
  },
  submit: {
    marginTop: 28,
  },
  submitInner: {
    height: 54,
    borderRadius: 27,
    backgroundColor: "#17171B",
    alignItems: "center",
    justifyContent: "center",
  },
  submitDisabled: {
    backgroundColor: "#D9D9DF",
  },
  submitPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  submitText: {
    fontSize: 16,
    fontFamily: "Saans-SemiBold",
    color: "#ffffff",
  },
});
