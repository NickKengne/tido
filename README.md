# Tido

A productivity app (task management and quick notes) built with Expo.

## Stack

- [Expo](https://docs.expo.dev/versions/v57.0.0/) SDK 57 (React Native 0.86, React 19) with [Expo Router](https://docs.expo.dev/router/introduction) (file-based routing, typed routes)
- [NativeWind](https://www.nativewind.dev) + Tailwind CSS for styling
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) for animations
- Screens and components adapted from [Lambda UI](https://lambdaui.shiplog-app.com)

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the terminal output, you'll find options to open the app in a [development build](https://docs.expo.dev/develop/development-builds/introduction/), an Android emulator, an iOS simulator, or [Expo Go](https://expo.dev/go).

## Project structure

App code lives in `src/`, with the `@/*` alias pointing to `src/*` (`@/assets/*` to `assets/*`):

```
src/
  app/          Expo Router routes (file-based routing)
  components/   reusable components
  constants/    theme (colors, fonts, spacing)
  hooks/        shared hooks
  global.css    global styles + Tailwind directives
```

## Current state

The project is in its foundation phase: the stack (Expo, NativeWind, Reanimated) is in place, and the product screens (tasks, notes) still need to be built.

## Development conventions

- Read the [Expo v57 docs](https://docs.expo.dev/versions/v57.0.0/) before using any Expo API — the platform moves fast.
- Reuse [Lambda UI](https://lambdaui.shiplog-app.com) screens/components as a base, adapted to the product with NativeWind.
- The `emil-design-eng` skill guides UI polish and animation decisions throughout development.

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router documentation](https://docs.expo.dev/router/introduction)
- [NativeWind documentation](https://www.nativewind.dev)
