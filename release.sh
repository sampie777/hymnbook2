#!/bin/bash

yarn test || exit 1

# Release version
git checkout master || exit 1
git merge develop || exit 1

npm --no-git-tag-version version patch || exit 1

yarn test || exit 1

RELEASE_VERSION=$(sed 's/.*"version": "\(.*\)".*/\1/;t;d' ./package.json)
echo "Release version: ${RELEASE_VERSION}"

git add package.json || exit 1
git commit -m "version release" || exit 1
git tag "v${RELEASE_VERSION}" || exit 1
git push -u origin master --tags || exit 1

yarn bundle || exit 1
yarn build || exit 1

# Generate next development version
git checkout develop || exit 1
git rebase master || exit 1

npm --no-git-tag-version version minor || exit 1
RELEASE_VERSION=$(sed 's/.*"version": "\(.*\)".*/\1/;t;d' ./package.json)-SNAPSHOT
echo "Next development version: ${DEV_VERSION}"
npm --no-git-tag-version version ${RELEASE_VERSION} || exit 1

git add package.json || exit 1
git commit -m "next development version" || exit 1
git push -u origin develop --tags || exit 1
