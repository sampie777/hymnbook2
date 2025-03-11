#!/bin/bash

progname=$(basename $0)

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

function retry() {
  command="$@"
  for i in {1..10}; do
    $command && return
    echo "Retrying attempt $i/10"
    sleep 3
  done

  echo "Retry failed for command: ${command}"
  exit 1
}

function setVersion() {
    version="$1"
    buildVersion=$(git rev-list HEAD --first-parent --count)

    npm --no-git-tag-version --allow-same-version version "${version}" || exit 1

    # Remove previous version tag
    echo "$(sed -e '/<key>CFBundleShortVersionString<\/key>/{n;d}' ./ios/hymnbook2/Info.plist)" > ./ios/hymnbook2/Info.plist || exit 1
    echo "$(sed -e '/<key>CFBundleVersion<\/key>/{n;d}' ./ios/hymnbook2/Info.plist)" > ./ios/hymnbook2/Info.plist || exit 1
    # Add new version tag
    echo "$(sed "/<key>CFBundleShortVersionString<\/key>/a \\\t\t<string>${version}<\/string>" ios/hymnbook2/Info.plist)" > ios/hymnbook2/Info.plist || exit 1
    echo "$(sed "/<key>CFBundleVersion<\/key>/a \\\t\t<string>${buildVersion}<\/string>" ios/hymnbook2/Info.plist)" > ios/hymnbook2/Info.plist || exit 1
}

function releasePatch {
  yarn test || exit 1

  git checkout master || exit 1
  retry git pull

  # Create patch version
  CURRENT_VERSION=$(sed 's/.*"version": "\(.*\)".*/\1/;t;d' ./package.json)
  RELEASE_VERSION=$(echo ${CURRENT_VERSION} | awk -F'.' '{print $1"."$2"."$3+1}')

  git merge develop || exit 1

  setVersion "${RELEASE_VERSION}" || exit 1

  pushAndRelease
}

function releaseMinor {
  yarn test || exit 1

  git checkout master || exit 1
  retry git pull
  git merge develop || exit 1

  # Create version
  npm --no-git-tag-version version minor || exit 1
  RELEASE_VERSION=$(sed 's/.*"version": "\(.*\)".*/\1/;t;d' ./package.json)

  setVersion "${RELEASE_VERSION}" || exit 1

  pushAndRelease
}

function releaseMajor {
  yarn test || exit 1

  git checkout master || exit 1
  retry git pull
  git merge develop || exit 1

  # Create version
  npm --no-git-tag-version version major || exit 1
  RELEASE_VERSION=$(sed 's/.*"version": "\(.*\)".*/\1/;t;d' ./package.json)

  setVersion "${RELEASE_VERSION}" || exit 1

  pushAndRelease
}

function pushAndRelease {
  yarn test || exit 1

  RELEASE_VERSION=$(sed 's/.*"version": "\(.*\)".*/\1/;t;d' ./package.json)
  echo "Release version: ${RELEASE_VERSION}"

  git add package.json || exit 1
  git add ios/hymnbook2/Info.plist || exit 1
  git commit -m "version release: ${RELEASE_VERSION}" || exit 1
  git tag "v${RELEASE_VERSION}" || exit 1

  yarn build || exit 1
  echo
  echo "BUILD DONE"
  echo
  echo
  yarn bundle || exit 1
  echo
  echo "BUNDLE DONE"
  echo
  echo

  retry git push -u origin master --tags

  retry ./upload_source_map.sh
}

function setNextDevelopmentVersion {
  git checkout develop || exit 1
  retry git pull
  git rebase master || exit 1

  # Generate next (minor) development version
  npm --no-git-tag-version version minor || exit 1
  DEV_VERSION=$(sed 's/.*"version": "\(.*\)".*/\1/;t;d' ./package.json)-SNAPSHOT

  echo "Next development version: ${DEV_VERSION}"
  setVersion "${DEV_VERSION}" || exit 1

  git add package.json || exit 1
  git add ios/hymnbook2/Info.plist || exit 1
  git commit -m "next development version" || exit 1
  retry git push -u origin develop --tags
}

command="$1"
case $command in
  patch)
    releasePatch
    setNextDevelopmentVersion
    xdg-open android/app/build/outputs/apk/release
    xdg-open android/app/build/outputs/bundle/release
    ;;
  minor)
    releaseMinor
    setNextDevelopmentVersion
    xdg-open android/app/build/outputs/apk/release
    xdg-open android/app/build/outputs/bundle/release
    ;;
  major)
    releaseMajor
    setNextDevelopmentVersion
    xdg-open android/app/build/outputs/apk/release
    xdg-open android/app/build/outputs/bundle/release
    ;;
  setNextDevelopmentVersion)
    setNextDevelopmentVersion
    ;;
  setversion)
    setVersion "$2"
    ;;
  -h|--help)
    usage
    ;;
  *)
    echo "Invalid command"
    exit 1
    ;;
esac

echo "Cleaning up test databases..."
rm hymnbook_songs 2> /dev/null
rm hymnbook_songs.lock 2> /dev/null
rm hymnbook_songs.note 2> /dev/null
rm -R hymnbook_songs.management 2> /dev/null
rm hymnbook_documents 2> /dev/null
rm hymnbook_documents.lock 2> /dev/null
rm hymnbook_documents.note 2> /dev/null
rm -R hymnbook_documents.management 2> /dev/null
rm hymnbook_settings 2> /dev/null
rm hymnbook_settings.lock 2> /dev/null
rm hymnbook_settings.note 2> /dev/null
rm -R hymnbook_settings.management 2> /dev/null

echo "Done"
