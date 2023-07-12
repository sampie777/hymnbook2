# Hymnbook

_App name may vary on project name_

### Description

Hymnbook is an app developed for Christian believers who want to carry hymns with them. The idea is to create one app for all types of churches. Backed by an online database, users can decide which song bundles they want to use in the app.

[![Google Play link: https://play.google.com/store/apps/details?id=nl.sajansen.hymnbook2](./resources/google-play-badge_250.png)](https://play.google.com/store/apps/details?id=nl.sajansen.hymnbook2)
[![Apple Store link: https://apps.apple.com/app/hymnbook/id1641070543](./resources/appstore-badge_250.png)](https://apps.apple.com/app/hymnbook/id1641070543)

## Develop

### Setup

Copy the file `.env.template` to `.env` and update the values a needed.

Run `yarn install`.

> Don't use node v19 as Realm installation will [hang](https://github.com/realm/realm-js/issues/5136)

#### Android

Run `yarn android`.

#### iOS

1. Run `pod install` in `ios/`.
2. Run `yarn ios` to fire up the simulator.

##### Pod install on ARM

When using a M1 Mac (with ARM instead of Intel), you'll probably get a Ruby error when running `pod install`. Solve this by installing the following:
```
gem install --user-install ffi -- --enable-libffi-alloc
```
[Source](https://stackoverflow.com/questions/68553842/error-installing-a-pod-bus-error-at-0x00000001045b8000?answertab=scoredesc#tab-top)

You might also need to exclude simulator build for arm64 in xcode: [source](https://stackoverflow.com/questions/63607158/xcode-building-for-ios-simulator-but-linking-in-an-object-file-built-for-ios-f?answertab=scoredesc#tab-top). This is already done in de Podfile.


### Development server

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

#### Production build

Apps should be signed for Google Play. 
Create keystore in `<projectroot>/android/app/`.
```bash
keytool -genkey -v -storetype PKCS12 -keystore hymnbook.keystore -alias hymnbook -keyalg RSA -keysize 2048 -validity 10000
```

Make sure keystore is correctly defined in:
`~/gradle/gradle.properties`.

### IOS

#### CLI

Build the app for Release scheme (in xcode you should edit the scheme for release).
```
npx react-native run-ios --configuration Release
```

A possible error might be resolved according to this post: [source](https://stackoverflow.com/questions/69692842/error-message-error0308010cdigital-envelope-routinesunsupported). 
```
export NODE_OPTIONS=--openssl-legacy-provider
```

... to be continued

#### Xcode

1. Checkout the master branch after release.
2. In Xcode: select the project target
3. Run the Archive under top menu -> Product
4. Approve all the steps
5. In appstoreconnect.apple.com, go to your app and then TestFlight
6. Wait for the uploaded build to be processed
7. Now, under App Store, create a new release under iOS App in the left menu
8. Fill in all the information and select the processed build (if it's not there, just wait)
9. When asked about encryption, say yes to both questions.
10. Save and submit.


## To do

- Add Hermes (https://reactnative.dev/docs/hermes) for decreased binary size and increased performance

## Upload to play store

```bash
yarn bundle
```

Upload the .aab file from `android/app/build/outputs/bundle/release/`.

Upload the .apk file to Github.

### Share

#### QR code

![Generated QR code image](./resources/qrcode.png)

If package name changes, create a new QR code at: https://developers.google.com/analytics/devguides/collection/android/v4/campaigns#google-play-url-builder

## Other stuff

### Song melody

The song melodies are en-/decoded using the ABC notation. The decoded notes are displayed by creating SVG images for each note. Each note/word forms its own 'block'/image and can scale horizontally independently. This way, the melody can be displayed and scaled across multiple lines without the need of horizontal scrolling. 

- Online ABC editor: https://editor.drawthedots.com/
- ABC standard: https://abcnotation.com/wiki/abc:standard:v2.1#special_symbols
- ABC examples: https://abcnotation.com/examples
- ABCjs types (incomplete): https://github.com/paulrosen/abcjs/blob/2616d88ddf0222e255c508f944df3089960c13dc/types/index.d.ts
- SVG library: https://github.com/react-native-svg/react-native-svg

### Fonts

For consistency purposes, we use the Roboto font. This is the default font on Android, but must be installed on iOS devices. Follow the following for installing fonts for iOS devices.

Before you add new fonts, make sure the file './react-native.config.js' exists and contains the path to the custom font directory, something linke this:
```
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/']
};
```

#### Add new font

- Download the font
- Add it to ./assets/fonts/
- (Maybe install them on your development system)
- Run `npx react-native link`
- (Maybe run `pod install` in .ios/ directory also, not sure)
- Fonts are installed

#### Use new font

Use these fonts by using there 'Full name' as shown in iOS Font Book

### Deep linking

Deep linking is used to share online resources between apps. Like sending a link to download a specific database (song bundle / document group).

To allow access to the main website (hymnbook.sajansen.nl), deep linking must use the `/open/` endpoint. This means every deep link must start with `https://hynbook.sajansen.nl/open/` followed by the specific deep link route. E.g. `https://hynbook.sajansen.nl/open/download/songs/00000000-0000-0000-0000-000000000000` will open in the app while `https://hymnbook.sajansen.nl/download` will always open in the browser.
