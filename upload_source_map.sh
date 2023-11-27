#!/bin/bash
# See also: https://docs.rollbar.com/docs/react-native#source-maps

# SERVERKEY should be defined in a file called upload_source_map_secrets.txt
SERVERKEY=""

source upload_source_map_secrets.txt
VERSION=$(sed 's/.*"version": "\(.*\)".*/\1/;t;d' ./package.json)


function removeDuplicateFiles {
  echo "Remove duplicate files (Android)"
  rm -rf android/app/src/main/res/drawable-hdpi/
  rm -rf android/app/src/main/res/drawable-mdpi/
  rm -rf android/app/src/main/res/drawable-xhdpi/
  rm -rf android/app/src/main/res/drawable-xxhdpi/
  rm -rf android/app/src/main/res/drawable-xxxhdpi/
  rm -rf android/app/src/main/res/raw/
}

function uploadSourceMapAndroid {
  echo "Uploading source map (Android)"
  curl https://api.rollbar.com/api/1/sourcemap \
  -F access_token=${SERVERKEY} \
  -F version=${VERSION}.android \
  -F minified_url=http://reactnativehost/index.android.bundle \
  -F source_map=@sourcemap.android.js \
  -F index.js=@index.js
}

function createAndUploadSourceMapAndroid {
  echo 'Creating source map (Android)'
  npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output \
  android/index.android.bundle --assets-dest android/app/src/main/res/ --sourcemap-output \
  sourcemap.android.js --sourcemap-sources-root ./ || return

  uploadSourceMapAndroid
  removeDuplicateFiles
}

function uploadSourceMapIOS {
  echo "Uploading source map (iOS)"
  curl https://api.rollbar.com/api/1/sourcemap \
  -F access_token=${SERVERKEY} \
  -F version=${VERSION}.ios \
  -F minified_url=http://reactnativehost/main.jsbundle \
  -F source_map=@sourcemap.ios.js \
  -F index.js=@index.js
}

function createAndUploadSourceMapIOS {
  echo "Creating source map (iOS)"
  npx react-native bundle --platform ios --entry-file index.js --dev false --bundle-output \
  ios/main.jsbundle --assets-dest ios --sourcemap-output sourcemap.ios.js --sourcemap-sources-root ./ || return

  uploadSourceMapIOS
}

function cleanUp {
    rm sourcemap.android.js
    rm sourcemap.ios.js
}

createAndUploadSourceMapAndroid
createAndUploadSourceMapIOS
cleanUp

echo "Done creating and uploading source maps"
