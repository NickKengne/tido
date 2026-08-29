import { StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 34;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Plain object (not StyleSheet.create) — CSS keyframe props aren't part of
// React Native's ViewStyle, only Reanimated's Animated.View style type.
const spinLoopStyle = {
  animationName: {
    from: { transform: [{ rotate: "0deg" }] },
    to: { transform: [{ rotate: "360deg" }] },
  },
  animationDuration: "800ms",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
} as const;

type RefreshIndicatorProps = {
  pull: SharedValue<number>;
  refreshing: SharedValue<boolean>;
  threshold: number;
  color?: string;
  trackColor?: string;
};

export function RefreshIndicator({
  pull,
  refreshing,
  threshold,
  color = "#000000",
  trackColor = "#E5E5EA",
}: RefreshIndicatorProps) {
  const containerStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      pull.get(),
      [0, threshold],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity: interpolate(
        pull.get(),
        [4, threshold * 0.6],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale: interpolate(progress, [0, 1], [0.6, 1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const chargeProps = useAnimatedProps(() => ({
    strokeDashoffset:
      CIRCUMFERENCE *
      (1 -
        interpolate(pull.get(), [0, threshold], [0, 1], Extrapolation.CLAMP)),
  }));

  const chargeStyle = useAnimatedStyle(() => ({
    opacity: refreshing.get() ? 0 : 1,
  }));

  const spinStyle = useAnimatedStyle(() => ({
    opacity: refreshing.get() ? 1 : 0,
  }));

  return (
    <Animated.View style={[styles.wrap, containerStyle]}>
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={trackColor}
          strokeWidth={STROKE}
          fill="none"
        />
      </Svg>

      <Animated.View style={[StyleSheet.absoluteFill, chargeStyle]}>
        <Svg width={SIZE} height={SIZE} style={styles.rotatedSvg}>
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            animatedProps={chargeProps}
          />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[StyleSheet.absoluteFill, spinLoopStyle, spinStyle]}
      >
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE * 0.72} ${CIRCUMFERENCE}`}
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  rotatedSvg: {
    transform: [{ rotate: "-90deg" }],
  },
});
