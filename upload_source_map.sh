#!/bin/bash
# See also: https://docs.rollbar.com/docs/react-native#source-maps

# Environment & dependency checks
function checkEnvironment {
  local missing=()
  for cmd in node curl sed git; do
    if ! command -v "$cmd" &>/dev/null; then
      missing+=("$cmd")
    fi
  done

  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "Error: The following required tools are missing from your PATH: ${missing[*]}" >&2
    exit 1
  fi
}

checkEnvironment

SECRETS_FILE="upload_source_map_secrets.txt"

if [[ ! -f "$SECRETS_FILE" ]]; then
  echo "Error: Secrets file '$SECRETS_FILE' not found!" >&2
  exit 1
fi

# SERVERKEY should be defined in upload_source_map_secrets.txt
SERVERKEY=""
source "$SECRETS_FILE"

if [[ -z "$SERVERKEY" ]]; then
  echo "Error: SERVERKEY is empty or not set in '$SECRETS_FILE'!" >&2
  exit 1
fi

VERSION=$(sed -n 's/.*"version": *"\{0,1\}\([^",]*\)"\{0,1\}.*/\1/p' ./package.json)
if [[ -z "$VERSION" ]]; then
  echo "Error: Could not determine version from package.json!" >&2
  exit 1
fi

function retry() {
  local command=("$@")
  for i in {1..10}; do
    "${command[@]}" && return 0
    echo "Retrying attempt $i/10..."
    sleep 3
  done

  echo "Retry failed for command: ${command[*]}" >&2
  return 1
}

function removeDuplicateFiles {
  echo "Remove duplicate files (Android)"
  rm -rf android/app/src/main/res/drawable-hdpi/
  rm -rf android/app/src/main/res/drawable-mdpi/
  rm -rf android/app/src/main/res/drawable-xhdpi/
  rm -rf android/app/src/main/res/drawable-xxhdpi/
  rm -rf android/app/src/main/res/drawable-xxxhdpi/
  rm -rf android/app/src/main/res/raw/
}

function verifyRollbarResponse {
  local response="$1"
  local platform="$2"

  if [[ -z "$response" ]]; then
    echo "Error: Empty response received from Rollbar for ${platform} source map upload!" >&2
    return 1
  fi

  # Check Rollbar JSON err code (Rollbar returns {"err": 0, "result": ...} on success or {"err": 1, "message": "..."} on error)
  # Uses node (guaranteed in React Native / JS repository) to parse JSON safely without python
  node -e '
    try {
      const data = JSON.parse(process.argv[1]);
      if (data.err !== 0) {
        process.exit(1);
      }
      process.exit(0);
    } catch (e) {
      process.exit(1);
    }
  ' "$response" 2>/dev/null
  local parse_status=$?

  if [[ $parse_status -ne 0 ]]; then
    echo "Error: Rollbar ${platform} source map upload failed! Response:" >&2
    echo "$response" >&2
    return 1
  fi

  echo "Successfully uploaded ${platform} source map to Rollbar."
  return 0
}

function uploadSourceMapAndroid {
  local map_file="./android/app/build/intermediates/sourcemaps/react/release/index.android.bundle.packager.map"
  if [[ ! -f "$map_file" ]]; then
    if [[ -f "sourcemap.android.js" ]]; then
      map_file="sourcemap.android.js"
    else
      echo "Error: Android source map file not found at '$map_file'!" >&2
      return 1
    fi
  fi

  echo "Uploading source map (Android)..."
  local response
  response=$(curl -sS --fail-with-body https://api.rollbar.com/api/1/sourcemap \
    -F access_token="${SERVERKEY}" \
    -F version="${VERSION}.android" \
    -F minified_url="http://reactnativehost/index.android.bundle" \
    -F source_map=@"$map_file")
  local curl_status=$?

  if [[ $curl_status -ne 0 ]]; then
    echo "Error: curl command failed while uploading Android source map (exit code: $curl_status)" >&2
    echo "$response" >&2
    return $curl_status
  fi

  verifyRollbarResponse "$response" "Android" || return 1
}

function createAndUploadSourceMapAndroid {
  echo 'Creating source map (Android)'
  local map_file="./android/app/build/intermediates/sourcemaps/react/release/index.android.bundle.packager.map"
  if [[ ! -f "$map_file" ]]; then
    npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output \
      android/index.android.bundle --assets-dest android/app/src/main/res/ --sourcemap-output \
      sourcemap.android.js --sourcemap-sources-root ./ || return 1
  fi
  retry uploadSourceMapAndroid || return 1
  removeDuplicateFiles
}

function uploadSourceMapIOS {
  local map_file="sourcemap.ios.js"
  if [[ ! -f "$map_file" ]]; then
    echo "Error: iOS source map file not found at '$map_file'!" >&2
    return 1
  fi

  echo "Uploading source map (iOS)..."
  local response
  response=$(curl -sS --fail-with-body https://api.rollbar.com/api/1/sourcemap \
    -F access_token="${SERVERKEY}" \
    -F version="${VERSION}.ios" \
    -F minified_url="http://reactnativehost/main.jsbundle" \
    -F source_map=@"$map_file")
  local curl_status=$?

  if [[ $curl_status -ne 0 ]]; then
    echo "Error: curl command failed while uploading iOS source map (exit code: $curl_status)" >&2
    echo "$response" >&2
    return $curl_status
  fi

  verifyRollbarResponse "$response" "iOS" || return 1
}

function createAndUploadSourceMapIOS {
  echo "Creating source map (iOS)..."
  npx react-native bundle --platform ios --entry-file index.js --dev false --bundle-output \
    ios/main.jsbundle --assets-dest ios --sourcemap-output sourcemap.ios.js --sourcemap-sources-root ./ || return 1

  retry uploadSourceMapIOS || return 1
}

function cleanUp {
  rm -f sourcemap.android.js
  rm -f sourcemap.ios.js
}

trap cleanUp EXIT

UPLOAD_EXIT_CODE=0

if ! createAndUploadSourceMapAndroid; then
  echo "Error: Android source map creation or upload failed. Continuing with iOS..." >&2
  UPLOAD_EXIT_CODE=1
fi

if ! createAndUploadSourceMapIOS; then
  echo "Error: iOS source map creation or upload failed." >&2
  UPLOAD_EXIT_CODE=1
fi

if [[ $UPLOAD_EXIT_CODE -ne 0 ]]; then
  echo "One or more source map uploads failed." >&2
  exit 1
fi

echo "Done creating and uploading source maps"
