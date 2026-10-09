#!/bin/bash

progname=$(basename "$0")

function usage {
  cat << HEREDOC

     Usage: $progname [command]

     commands:
       patch                  Release a patch version (0.0.X)
       minor                  Release a minor version (0.X.0)
       major                  Release a major version (X.0.0)
       setversion <version>   Change version to <version>
       -h, --help             Show this help message and exit

HEREDOC
}

# Environment & preflight checks
function checkEnvironment {
  local missing=()
  for cmd in node yarn git sed awk; do
    if ! command -v "$cmd" &>/dev/null; then
      missing+=("$cmd")
    fi
  done

  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "Error: Required tools are missing from your PATH: ${missing[*]}" >&2
    echo "Please install them before running $progname." >&2
    exit 1
  fi

  # Check Java availability and version compatibility for Android build
  if ! command -v java &>/dev/null; then
    echo ""
    echo "============================================================"
    echo "  WARNING: 'java' command not found in your PATH!"
    echo "  The Android build ('yarn build' / 'yarn bundle') will fail."
    echo "============================================================"
    if [[ -t 0 ]]; then
      read -r -p "Do you want to continue anyway? (y/N): " response
      case "$response" in
        [yY][eE][sS]|[yY])
          echo "Continuing release without Java..."
          ;;
        *)
          echo "Aborting release. Please install or configure Java."
          exit 1
          ;;
      esac
    else
      echo "Non-interactive terminal detected: aborting release due to missing Java." >&2
      exit 1
    fi
    echo ""
  else
    local java_version_raw
    local java_major
    java_version_raw=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
    # Extract major version number (handles "1.8.x" as 8, "17.0.x" as 17, "21.0.x" as 21, etc.)
    java_major=$(echo "$java_version_raw" | awk -F'.' '{if ($1 == "1") print $2; else print $1}')

    # Gradle 8.14.3 supports Java 17 through 21 (Gradle 8.x supports max Java 21, Java 22+ may fail)
    # Minimum required for React Native / AGP 8 is Java 17
    if [[ -n "$java_major" && ($java_major -lt 17 || $java_major -gt 21) ]]; then
      echo ""
      echo "============================================================"
      echo "  WARNING: Incompatible Java version detected: $java_version_raw (Major: $java_major)"
      echo "  The Android build (Gradle 8.14.3 / React Native) requires"
      echo "  Java version between 17 and 21 (Java 17 or 21 recommended)."
      echo "  Building with Java $java_major is likely to fail or produce errors."
      echo "============================================================"
      if [[ -t 0 ]]; then
        read -r -p "Do you want to continue building despite Java incompatibility? (y/N): " response
        case "$response" in
          [yY][eE][sS]|[yY])
            echo "Continuing release with current Java version ($java_version_raw)..."
            ;;
          *)
            echo "Aborting release. Please switch to a compatible Java version (JDK 17 - 21)."
            exit 1
            ;;
        esac
      else
        echo "Non-interactive terminal detected: continuing with Java warning."
      fi
      echo ""
    fi
  fi

  # Check for .env file
  if [[ ! -f ".env" ]]; then
    echo ""
    echo "============================================================"
    echo "  WARNING: '.env' file not found in the project root!"
    echo "  Building without '.env' may result in missing configuration"
    echo "  or secrets required by the application."
    echo "============================================================"
    if [[ -t 0 ]]; then
      read -r -p "Do you want to continue building without .env? (y/N): " response
      case "$response" in
        [yY][eE][sS]|[yY])
          echo "Continuing release without .env..."
          ;;
        *)
          echo "Aborting release. Please provide a .env file."
          exit 1
          ;;
      esac
    else
      echo "Non-interactive terminal detected: continuing with warning."
    fi
    echo ""
  fi

  # Check for google-services.json
  if [[ ! -f "android/app/google-services.json" ]]; then
    echo ""
    echo "============================================================"
    echo "  WARNING: 'android/app/google-services.json' not found!"
    echo "  If Google Services or Firebase is configured, the Android"
    echo "  release build might fail or behave unexpectedly."
    echo "============================================================"
    echo ""
  fi
}

# State tracking for rollback
ORIGINAL_BRANCH=""
INITIAL_BRANCH_SAVED=0
ORIGINAL_MASTER_COMMIT=""
ORIGINAL_DEVELOP_COMMIT=""
TAG_CREATED=""
MASTER_COMMITTED=0
MASTER_PUSHED=0
DEVELOP_COMMITTED=0
DEVELOP_PUSHED=0
ROLLBACK_DONE=0

function initRollbackTracking {
  ORIGINAL_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || git rev-parse HEAD)
  INITIAL_BRANCH_SAVED=1
  ORIGINAL_MASTER_COMMIT=$(git rev-parse -q --verify master 2>/dev/null)
  ORIGINAL_DEVELOP_COMMIT=$(git rev-parse -q --verify develop 2>/dev/null)
}

function rollback {
  local exit_code=$?
  # If exit code is 0 or rollback was already handled, do nothing
  if [[ $exit_code -eq 0 || $ROLLBACK_DONE -eq 1 ]]; then
    return
  fi
  ROLLBACK_DONE=1

  # Only trigger rollback actions if we were executing a release command that initialized tracking
  if [[ $INITIAL_BRANCH_SAVED -eq 0 ]]; then
    return
  fi

  echo ""
  echo "============================================================"
  echo "  ERROR DETECTED (Exit code: $exit_code). INITIATING ROLLBACK..."
  echo "============================================================"

  # 1. Delete created tag if not pushed or already pushed
  if [[ -n "$TAG_CREATED" ]]; then
    echo "Rolling back git tag '$TAG_CREATED'..."
    git tag -d "$TAG_CREATED" 2>/dev/null || true
    if [[ $MASTER_PUSHED -eq 1 ]]; then
      echo "Deleting remote git tag '$TAG_CREATED' on origin..."
      git push origin --delete "$TAG_CREATED" 2>/dev/null || true
    fi
  fi

  # 2. Reset master branch if modified locally
  if [[ -n "$ORIGINAL_MASTER_COMMIT" ]]; then
    if [[ $MASTER_PUSHED -eq 0 && $MASTER_COMMITTED -eq 1 ]]; then
      echo "Resetting local master branch to original commit ($ORIGINAL_MASTER_COMMIT)..."
      git checkout master 2>/dev/null || true
      git reset --hard "$ORIGINAL_MASTER_COMMIT" 2>/dev/null || true
    fi
  fi

  # 3. Reset develop branch if modified locally
  if [[ -n "$ORIGINAL_DEVELOP_COMMIT" ]]; then
    if [[ $DEVELOP_PUSHED -eq 0 && $DEVELOP_COMMITTED -eq 1 ]]; then
      echo "Resetting local develop branch to original commit ($ORIGINAL_DEVELOP_COMMIT)..."
      git checkout develop 2>/dev/null || true
      git reset --hard "$ORIGINAL_DEVELOP_COMMIT" 2>/dev/null || true
    fi
  fi

  # 4. Abort any rebase/merge in progress and clean working tree
  git rebase --abort 2>/dev/null || true
  git merge --abort 2>/dev/null || true
  git checkout -- . 2>/dev/null || true

  # 5. Return to the starting branch
  if [[ $INITIAL_BRANCH_SAVED -eq 1 && -n "$ORIGINAL_BRANCH" ]]; then
    echo "Switching back to initial branch '$ORIGINAL_BRANCH'..."
    git checkout "$ORIGINAL_BRANCH" 2>/dev/null || true
  fi

  echo "============================================================"
  echo "  Rollback completed. Please fix the error and try again."
  if [[ $MASTER_PUSHED -eq 1 ]]; then
    echo "  NOTE: master was already pushed before the error occurred."
    echo "  Local unpushed changes/tags were rolled back."
  fi
  echo "============================================================"
}

trap rollback ERR EXIT

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

function setVersion() {
    local version="$1"
    local buildVersion
    buildVersion=$(git rev-list HEAD --first-parent --count)

    # Update version in package.json using sed
    sed -i '' -E 's/("version": ")([^"]+)(")/\1'"$version"'\3/' package.json || return 1

    # Remove previous version tag
    echo "$(awk '/<key>CFBundleShortVersionString<\/key>/{print; getline; next} 1' ./ios/hymnbook2/Info.plist)" > ./ios/hymnbook2/Info.plist || return 1
    echo "$(awk '/<key>CFBundleVersion<\/key>/{print; getline; next} 1' ./ios/hymnbook2/Info.plist)" > ./ios/hymnbook2/Info.plist || return 1
    # Add new version tag
    echo "$(sed "/<key>CFBundleShortVersionString<\/key>/a\\
	<string>${version}<\/string>
    " ios/hymnbook2/Info.plist)" > ios/hymnbook2/Info.plist || return 1
    echo "$(sed "/<key>CFBundleVersion<\/key>/a\\
	<string>${buildVersion}<\/string>
    " ios/hymnbook2/Info.plist)" > ios/hymnbook2/Info.plist || return 1
}

function updateDependencies {
  yarn install || return 1
  cd ios || return 1
  bundle exec pod install || pod install || { cd ..; return 1; }
  cd .. || return 1

  git add .yarnrc.yml 2>/dev/null || true
  git add yarn.lock 2>/dev/null || true
  git add package.json 2>/dev/null || true
  git add ios/Podfile 2>/dev/null || true
  git add ios/Podfile.lock 2>/dev/null || true

  if [[ $(git diff --name-only --cached) ]]; then
    echo "There are uncommitted changes in the repository."
    git status --short
    echo ""
    echo "Please commit the dependency/pod updates before proceeding."
    return 1
  fi
  return 0
}

function releasePatch {
  yarn test || return 1

  git checkout master || return 1
  retry git pull || return 1

  # Create patch version
  CURRENT_VERSION=$(sed -n 's/.*"version": *"\{0,1\}\([^",]*\)"\{0,1\}.*/\1/p' ./package.json)
  RELEASE_VERSION=$(echo ${CURRENT_VERSION} | awk -F'.' '{print $1"."$2"."$3+1}')

  git merge develop || return 1

  setVersion "${RELEASE_VERSION}" || return 1

  pushAndRelease || return 1
}

function releaseMinor {
  yarn test || return 1

  git checkout master || return 1
  retry git pull || return 1

  # Create version
  CURRENT_VERSION=$(sed -n 's/.*"version": *"\{0,1\}\([^",]*\)"\{0,1\}.*/\1/p' ./package.json)
  RELEASE_VERSION=$(echo ${CURRENT_VERSION} | sed 's/v//g' | awk -F'.' '{print $1"."$2+1".0"}')

  git merge develop || return 1

  setVersion "${RELEASE_VERSION}" || return 1

  pushAndRelease || return 1
}

function releaseMajor {
  yarn test || return 1

  git checkout master || return 1
  retry git pull || return 1

  # Create version
  CURRENT_VERSION=$(sed -n 's/.*"version": *"\{0,1\}\([^",]*\)"\{0,1\}.*/\1/p' ./package.json)
  RELEASE_VERSION=$(echo ${CURRENT_VERSION} | sed 's/v//g' | awk -F'.' '{print $1+1".0.0"}')

  git merge develop || return 1

  setVersion "${RELEASE_VERSION}" || return 1

  pushAndRelease || return 1
}

function pushAndRelease {
  yarn test || return 1

  RELEASE_VERSION=$(sed -n 's/.*"version": *"\{0,1\}\([^",]*\)"\{0,1\}.*/\1/p' ./package.json)
  echo "Release version: ${RELEASE_VERSION}"

  git add package.json || return 1
  git add ios/hymnbook2/Info.plist || return 1
  git commit -m "version release: ${RELEASE_VERSION}" || return 1
  MASTER_COMMITTED=1

  TAG_CREATED="v${RELEASE_VERSION}"
  git tag "${TAG_CREATED}" || return 1

  yarn build || return 1
  echo
  echo "BUILD DONE"
  echo
  echo
  yarn bundle || return 1
  echo
  echo "BUNDLE DONE"
  echo
  echo

  retry git push -u origin master --tags || return 1
  MASTER_PUSHED=1

  xdg-open android/app/build/outputs/apk/release || open android/app/build/outputs/apk/release || echo ""
  xdg-open android/app/build/outputs/bundle/release || open android/app/build/outputs/bundle/release || echo ""

  ./upload_source_map.sh || {
    echo ""
    echo "Warning: Source map upload failed. Continuing release without rollback as source maps are not critical." >&2
    echo ""
  }
}

function setNextDevelopmentVersion {
  git checkout develop || return 1
  retry git pull || return 1
  git rebase master || return 1

  # Generate next (minor) development version
  CURRENT_VERSION=$(sed -n 's/.*"version": *"\{0,1\}\([^",]*\)"\{0,1\}.*/\1/p' ./package.json)
  DEV_VERSION=$(echo ${CURRENT_VERSION} | sed 's/v//g' | awk -F'.' '{print $1"."$2+1".0"}')-SNAPSHOT

  echo "Next development version: ${DEV_VERSION}"
  setVersion "${DEV_VERSION}" || return 1

  git add package.json || return 1
  git add ios/hymnbook2/Info.plist || return 1
  git commit -m "next development version" || return 1
  DEVELOP_COMMITTED=1

  retry git push -u origin develop --tags || return 1
  DEVELOP_PUSHED=1
}

function cleanTestDatabases {
  echo "Cleaning up test databases..."
  rm -f hymnbook_songs hymnbook_songs.lock hymnbook_songs.note
  rm -rf hymnbook_songs.management
  rm -f hymnbook_documents hymnbook_documents.lock hymnbook_documents.note
  rm -rf hymnbook_documents.management
  rm -f hymnbook_settings hymnbook_settings.lock hymnbook_settings.note
  rm -rf hymnbook_settings.management
}

command="$1"
case $command in
  patch)
    checkEnvironment
    initRollbackTracking
    updateDependencies || exit 1
    releasePatch || exit 1
    setNextDevelopmentVersion || exit 1
    ;;
  minor)
    checkEnvironment
    initRollbackTracking
    updateDependencies || exit 1
    releaseMinor || exit 1
    setNextDevelopmentVersion || exit 1
    ;;
  major)
    checkEnvironment
    initRollbackTracking
    updateDependencies || exit 1
    releaseMajor || exit 1
    setNextDevelopmentVersion || exit 1
    ;;
  setNextDevelopmentVersion)
    checkEnvironment
    initRollbackTracking
    setNextDevelopmentVersion || exit 1
    ;;
  setversion)
    setVersion "$2" || exit 1
    ;;
  updateDependencies)
    checkEnvironment
    updateDependencies || exit 1
    ;;
  -h|--help)
    usage
    exit 0
    ;;
  *)
    echo "Invalid command" >&2
    usage
    exit 1
    ;;
esac

cleanTestDatabases

echo "Done"
