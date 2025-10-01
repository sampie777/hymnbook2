#!/bin/zsh

# Add all your environment variables here
echo "===== Setting environment variables ====="
echo "ROLLBAR_API_KEY=${ROLLBAR_API_KEY}" > ../../.env
echo "DEVELOPER_EMAIL=${DEVELOPER_EMAIL}" >> ../../.env
echo "WHATSAPP_USER_GROUP_LINK=${WHATSAPP_USER_GROUP_LINK}" >> ../../.env
echo "HYMNBOOK_STRIPE_PUBLISHABLE_KEY=${HYMNBOOK_STRIPE_PUBLISHABLE_KEY}" >> ../../.env
echo "HYMNBOOK_STRIPE_TEST_PUBLISHABLE_KEY=${HYMNBOOK_STRIPE_TEST_PUBLISHABLE_KEY}" >> ../../.env

echo "===== Installing CocoaPods ====="
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
gem install bundler
cd ..
bundle install

echo "===== Installing Node.js ====="
# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
# Load nvm and install Node.js
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
nvm install 22

echo "===== Installing yarn ====="
corepack enable yarn
corepack install yarn

# Install dependencies
echo "===== Running yarn install ====="
yarn install

function podInstall {
  echo "===== Running pod repo update ====="
  bundle exec pod repo update
  echo "===== Running pod install ====="
  bundle exec pod install && return
  echo "  === Running pod update ===  "
  bundle exec pod update
  echo "  === Running pod install ===  "
  bundle exec pod install && return
  exit 1
}
podInstall