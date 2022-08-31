#!/bin/bash

progname=$(basename $0)

function usage {
  cat << HEREDOC

     Usage: $progname [command]

     commands:
       patch                  Release a patch version (0.0.X)
       minor                  Release a minor version (0.X.0)
       setversion <version>   Change version to <version>
       -h, --help             Show this help message and exit

HEREDOC
}

function setVersion() {
    version="$1"

    npm --no-git-tag-version version "${version}" || exit 1

    # Remove previous version tag
    echo "$(sed -e '/<key>CFBundleShortVersionString<\/key>/{n;d}' ./ios/hymnbook2/Info.plist)" > ./ios/hymnbook2/Info.plist || exit 1
    # Add new version tag
    echo "$(sed "/<key>CFBundleShortVersionString<\/key>/a \\\t<string>${version}<\/string>" ios/hymnbook2/Info.plist)" > ios/hymnbook2/Info.plist || exit 1
}

function releasePatch {
  yarn test || exit 1

  git checkout master || exit 1

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
  git merge develop || exit 1

  # Create patch version
  CURRENT_VERSION=$(sed 's/.*"version": "\(.*\)".*/\1/;t;d' ./package.json)
  RELEASE_VERSION=$(echo ${CURRENT_VERSION} | awk -F'.' '{print $1"."$2+1".0"}')

  setVersion "${RELEASE_VERSION}" || exit 1

  pushAndRelease
}

function pushAndRelease {
  yarn test || exit 1

  RELEASE_VERSION=$(sed 's/.*"version": "\(.*\)".*/\1/;t;d' ./package.json)
  echo "Release version: ${RELEASE_VERSION}"

  git add package.json || exit 1
  git commit -m "version release: ${RELEASE_VERSION}" || exit 1
  git tag "v${RELEASE_VERSION}" || exit 1
  git push -u origin master --tags || exit 1

  yarn bundle || exit 1
  yarn build || exit 1

  ./upload_source_map.sh
}

function setNextDevelopmentVersion {
  git checkout develop || exit 1
  git rebase master || exit 1

  # Generate next (minor) development version
  npm --no-git-tag-version version minor || exit 1
  DEV_VERSION=$(sed 's/.*"version": "\(.*\)".*/\1/;t;d' ./package.json)-SNAPSHOT

  echo "Next development version: ${DEV_VERSION}"
  setVersion "${DEV_VERSION}" || exit 1

  git add package.json || exit 1
  git commit -m "next development version" || exit 1
  git push -u origin develop --tags || exit 1
}

command="$1"
case $command in
  patch)
    releasePatch
    setNextDevelopmentVersion
    ;;
  minor)
    releaseMinor
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
