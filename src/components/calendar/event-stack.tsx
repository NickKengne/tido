import { useCallback, useMemo, useState } from "react";
import * as Haptics from "expo-haptics";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { EventCard } from "@/components/calendar/event-card";
import type { CalendarEvent } from "@/data/calendar-events";

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const SWIPE_THRESHOLD = 120;
const FLY_OUT_DISTANCE = 480;
const MAX_PEEKS = 2;

// Apple's exponential-decay projection — where the finger would land if it
// kept decelerating, so a fast short flick commits like a slow long drag.
function project(velocity: number, decelerationRate = 0.998) {
  "worklet";
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

type EventStackProps = {
  events: CalendarEvent[];
  onPressEvent?: (event: CalendarEvent) => void;
  onLongPressEvent?: (event: CalendarEvent) => void;
};

// Multiple events in the same hour stack like cards in a deck: the front
// card is draggable, swipe it away (tinder-style) to cycle to the next one.
// Non-destructive — swiping just rotates the order, nothing is discarded.
export function EventStack({ events, onPressEvent, onLongPressEvent }: EventStackProps) {
  // Ordering is kept by id, not index — `events` can shrink or reorder out
  // from under this component (an edit/delete elsewhere in the store rebuilds
  // the whole bucket), and a raw index surviving a delete would point past
  // the new, shorter array. Reconciling by id on every render (drop ids no
  // longer present, append any new ones) means the render can never index a
  // missing event; `order` state itself is only ever touched by a swipe.
  const [order, setOrder] = useState(() => events.map((e) => e.id));
  const eventById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);
  const safeOrder = useMemo(() => {
    const presentIds = events.map((e) => e.id);
    const presentSet = new Set(presentIds);
    const kept = order.filter((id) => presentSet.has(id));
    const keptSet = new Set(kept);
    const added = presentIds.filter((id) => !keptSet.has(id));
    return [...kept, ...added];
  }, [order, events]);

  const translateX = useSharedValue(0);

  const advance = useCallback(() => {
    setOrder(() => [...safeOrder.slice(1), safeOrder[0]]);
    translateX.set(0);
  }, [safeOrder, translateX]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((e) => {
          translateX.set(e.translationX);
        })
        .onEnd((e) => {
          const projected = translateX.get() + project(e.velocityX);
          if (safeOrder.length > 1 && Math.abs(projected) > SWIPE_THRESHOLD) {
            const direction = projected > 0 ? 1 : -1;
            translateX.set(
              withTiming(
                direction * FLY_OUT_DISTANCE,
                { duration: 200, easing: EASE_OUT },
                (finished) => {
                  if (finished) scheduleOnRN(advance);
                },
              ),
            );
            scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Light);
          } else {
            translateX.set(
              withSpring(0, { duration: 300, dampingRatio: 0.8, velocity: e.velocityX }),
            );
          }
        }),
    [safeOrder, advance, translateX],
  );

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.get() },
      {
        rotateZ: `${interpolate(
          translateX.get(),
          [-FLY_OUT_DISTANCE, FLY_OUT_DISTANCE],
          [-8, 8],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
  }));

  if (safeOrder.length === 0) return null;

  const front = eventById.get(safeOrder[0])!;
  const peeks = safeOrder.slice(1, 1 + MAX_PEEKS).map((id) => eventById.get(id)!);

  return (
    <View style={styles.wrap}>
      {peeks
        .map((event, i) => ({ event, depth: i + 1 }))
        .reverse()
        .map(({ event, depth }) => (
          <View
            key={event.id}
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: 1 - depth * 0.18,
                transform: [{ translateY: depth * 10 }, { scale: 1 - depth * 0.05 }],
              },
            ]}
          >
            <EventCard
              compact
              title={event.title}
              subtitle={event.subtitle}
              time={event.time}
              backgroundColor={event.backgroundColor}
              avatars={event.avatars}
            />
          </View>
        ))}

      <GestureDetector gesture={pan}>
        {/* GestureDetector's child doesn't inherit the parent's default
            stretch-to-full-width the way a plain sibling View does — it
            needs an explicit width or it hugs its (variable) text content
            and drifts from the peek layers behind it. */}
        <Animated.View style={[styles.frontWrap, frontStyle]}>
          <EventCard
            compact
            title={front.title}
            subtitle={front.subtitle}
            time={front.time}
            backgroundColor={front.backgroundColor}
            avatars={front.avatars}
            onPress={() => onPressEvent?.(front)}
            onLongPress={() => onLongPressEvent?.(front)}
          />
        </Animated.View>
      </GestureDetector>

      {safeOrder.length > 1 ? (
        <View style={styles.counter}>
          <Text style={styles.counterText}>+{safeOrder.length - 1}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
  },
  frontWrap: {
    width: "100%",
  },
  counter: {
    position: "absolute",
    top: -8,
    right: -8,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: "#17171B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FAFAFC",
  },
  counterText: {
    fontSize: 11,
    fontFamily: "Saans-SemiBold",
    color: "#ffffff",
  },
});
