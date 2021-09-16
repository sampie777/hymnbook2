# Hymn book

_App name may vary on project name_

## Develop

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

### Rebuild

If things aren't going as planned, rebuild the whole project:

```bash
cd android/
./gradlew clean
cd ..


yarn start --reset-cache 
```

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
