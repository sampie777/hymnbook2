#!/bin/zsh

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

echo "===== Setting environment variables ====="
echo "DEVELOPER_EMAIL=${DEVELOPER_EMAIL}"
echo "ROLLBAR_API_KEY=${ROLLBAR_API_KEY}"
ls -alh
echo "ROLLBAR_API_KEY=${ROLLBAR_API_KEY}" > .env
echo "DEVELOPER_EMAIL=${DEVELOPER_EMAIL}" >> .env
echo "WHATSAPP_USER_GROUP_LINK=${WHATSAPP_USER_GROUP_LINK}" >> .env
echo "== Reading back .env file =="
cat .env

echo "===== Running pod install ====="
pwd
pod install
