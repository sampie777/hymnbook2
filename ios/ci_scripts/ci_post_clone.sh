#!/bin/zsh

echo "===== Setting environment variables ====="
echo "ROLLBAR_API_KEY=${ROLLBAR_API_KEY}" > ../../.env
echo "DEVELOPER_EMAIL=${DEVELOPER_EMAIL}" >> ../../.env
echo "WHATSAPP_USER_GROUP_LINK=${WHATSAPP_USER_GROUP_LINK}" >> ../../.env

echo "===== Installing CocoaPods ====="
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install cocoapods

echo "===== Installing Node.js ====="
# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
# Load nvm and install Node.js
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
nvm install 18

echo "===== Installing yarn ====="
brew install yarn

# Install dependencies
echo "===== Running yarn install ====="
yarn install

function podInstall {
  echo "===== Running pod install ====="
  pod install && return

  echo "  === Running pod update 1 ===  "
  pod update
  echo "  === Running pod install 1 ===  "
  pod install && return

  echo "  === Running repo pod update 2 ===  "
  pod repo update
  echo "  === Running pod update 2 ===  "
  pod update
  echo "  === Running pod install 2 ===  "
  pod install --repo-update && return

  echo "  === Running pod update 3 ===  "
  pod update
  echo "  === Running pod install 3 ===  "
  pod install && return
  exit 1
}
podInstall