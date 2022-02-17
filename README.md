# Hymn book

_App name may vary on project name_

Play store: [https://play.google.com/store/apps/details?id=nl.sajansen.hymnbook2](https://play.google.com/store/apps/details?id=nl.sajansen.hymnbook2)

## Develop

### Environment

Start development server:

```bash
yarn start
# OR
npx react-native start
```

Deploy development app onto emulator:

```bash
yarn android
# OR
npx react-native run-android
```

#### Rebuild

If things aren't going as planned, rebuild the whole project:

```bash
cd android/
./gradlew clean
cd ..


yarn start --reset-cache 
```

### Configuration

To change app name: https://stackoverflow.com/a/68641035/2806723
- /app.json -> displayName
- /android/app/src/main/res/values/strings.xml -> app_name
- /ios/hymnbook2/Info.plist -> CFBundleDisplayName


## Build

### Android 

```bash
yarn build
# OR
cd android/
./gradlew assembleRelease 
```

Output APK's will be in `android/app/build/outputs/apk/release`. 

### IOS

No idea.

### Production build

Create keystore in `android/`.
```bash
keytool -genkey -v -storetype PKCS12 -keystore hymnbook.keystore -alias hymnbookKey -keyalg RSA -keysize 2048 -validity 10000
```

Make sure keystore is correctly defined in:
`android/gradle.properties`.

## To do

- Match Android font families with IOS families.
- Fix default sorting mechanism for song titles (102 is displayed before 2 but should be the other way around)
- Add Hermes (https://reactnative.dev/docs/hermes) for decreased binary size and increased performance

### Known issues

- Scrolling to out-of-rendered-zone doesn't work. E.g., 20 verses are loaded but one want to scroll to verse 30. That doesn't work and as fallback it will scroll to half the index (verse 15).

## Upload to play store

```bash
yarn bundle
# OR
cd android && ./gradlew bundleRelease
```

Upload the .aab file from `android/app/build/outputs/bundle/release/`.


### Share

#### QR coe

If package name changes, create a new QR code at: https://developers.google.com/analytics/devguides/collection/android/v4/campaigns#google-play-url-builder

# Other stuff

## Song melody

The song melodies are en-/decoded using the ABC notation. The decoded notes are displayed by creating SVG images for each note. Each note/word forms its own 'block'/image and can scale horizontally independently. This way, the melody can be displayed and scaled across multiple lines without the need of horizontal scrolling. 

- Online ABC editor: https://editor.drawthedots.com/
- ABC standard: https://abcnotation.com/wiki/abc:standard:v2.1#special_symbols
- ABC examples: https://abcnotation.com/examples
- ABCjs types (incomplete): https://github.com/paulrosen/abcjs/blob/2616d88ddf0222e255c508f944df3089960c13dc/types/index.d.ts
- SVG library: https://github.com/react-native-svg/react-native-svg
- 
