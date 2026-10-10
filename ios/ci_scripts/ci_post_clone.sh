#!/bin/zsh

set -eo pipefail

echo "===== Starting ci_post_clone.sh ====="

# 1. Resolve repository root
# In Xcode Cloud, $CI_WORKSPACE is set to the repository root directory.
if [[ -n "$CI_WORKSPACE" && -d "$CI_WORKSPACE" ]]; then
  REPO_ROOT="$CI_WORKSPACE"
else
  REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
fi

echo "Repository root: ${REPO_ROOT}"
cd "${REPO_ROOT}"

# 2. Check iOS Info.plist version format (Apple requirement ITMS-90096)
echo "===== Validating iOS version ====="
INFO_PLIST="${REPO_ROOT}/ios/hymnbook2/Info.plist"

if [[ ! -f "${INFO_PLIST}" ]]; then
  echo "Error: Required file 'Info.plist' not found at '${INFO_PLIST}'!" >&2
  exit 1
fi

if command -v /usr/libexec/PlistBuddy &>/dev/null; then
  APP_VERSION=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "${INFO_PLIST}" 2>/dev/null || true)
else
  APP_VERSION=$(awk '/<key>CFBundleShortVersionString<\/key>/{getline; print}' "${INFO_PLIST}" | sed -E 's/.*<string>([^<]+)<\/string>.*/\1/' || true)
fi

echo "Detected CFBundleShortVersionString: '${APP_VERSION}'"

# Apple ITMS-90096 requires CFBundleShortVersionString to be a period-separated list of at most three non-negative integers:
# Examples: 1, 1.2, or 1.2.3. No letters, hyphens (-SNAPSHOT), prefixes, or 4th components allowed.
if [[ ! "${APP_VERSION}" =~ ^[0-9]+(\.[0-9]+){0,2}$ ]]; then
  echo "============================================================" >&2
  echo "  ERROR: CFBundleShortVersionString is invalid: '${APP_VERSION}'." >&2
  echo "  Apple App Store requires CFBundleShortVersionString to be a" >&2
  echo "  period-separated list of at most three non-negative integers" >&2
  echo "  (e.g., '1.34.0' or '1.0')." >&2
  echo "  Letters, hyphens (e.g. '-SNAPSHOT'), or symbols are not allowed." >&2
  echo "  Failing build early to save CI resources." >&2
  echo "============================================================" >&2
  exit 1
fi

# 3. Write environment variables to .env
echo "===== Generating .env file ====="
ENV_FILE="${REPO_ROOT}/.env"

cat << EOF > "${ENV_FILE}"
ROLLBAR_API_KEY=${ROLLBAR_API_KEY}
DEVELOPER_EMAIL=${DEVELOPER_EMAIL}
WHATSAPP_USER_GROUP_LINK=${WHATSAPP_USER_GROUP_LINK}
HYMNBOOK_STRIPE_PUBLISHABLE_KEY=${HYMNBOOK_STRIPE_PUBLISHABLE_KEY}
HYMNBOOK_STRIPE_TEST_PUBLISHABLE_KEY=${HYMNBOOK_STRIPE_TEST_PUBLISHABLE_KEY}
EOF

# Check and warn if critical variables are missing
if [[ -z "${ROLLBAR_API_KEY}" ]]; then
  echo "Warning: ROLLBAR_API_KEY is not defined in the environment!" >&2
fi

# 4. Setup Node.js
echo "===== Checking Node.js ====="
if command -v node &>/dev/null; then
  echo "Node.js already available: $(node --version)"
else
  echo "Installing Node.js via nvm..."
  export NVM_DIR="$HOME/.nvm"
  if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  fi
  # Load nvm
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 22
  nvm use 22
fi

# Ensure node/npm/yarn paths are exported for subsequent Xcode Cloud build phases
NODE_BIN_DIR="$(dirname "$(which node)")"
export PATH="${NODE_BIN_DIR}:${PATH}"
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# 5. Setup Yarn & Install Dependencies
echo "===== Setting up Yarn ====="
if command -v corepack &>/dev/null; then
  echo "Enabling corepack..."
  corepack enable || true
  corepack install || true
fi

if ! command -v yarn &>/dev/null; then
  echo "Installing yarn via npm..."
  npm install -g yarn --force
fi

echo "Yarn version: $(yarn --version)"
echo "===== Installing JavaScript dependencies ====="
yarn install --immutable || yarn install

# 6. CocoaPods installation & execution with fallback
echo "===== Setting up CocoaPods ====="
cd "${REPO_ROOT}/ios"

function runPodInstallWithBundler {
  echo "Attempting CocoaPods installation via Bundler (matching Gemfile)..."
  if ! command -v bundle &>/dev/null; then
    gem install bundler --no-document
  fi
  (cd "${REPO_ROOT}" && bundle install)
  bundle exec pod install
}

function runPodInstallSystem {
  echo "Attempting CocoaPods installation via system pod..."
  if ! command -v pod &>/dev/null; then
    echo "Installing cocoapods gem..."
    gem install cocoapods --no-document || {
      export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
      brew install cocoapods
    }
  fi
  pod install
}

function runPodInstallFallback {
  echo "Running pod repo update & fallback pod update..."
  if command -v bundle &>/dev/null && bundle exec pod --version &>/dev/null; then
    bundle exec pod repo update || true
    bundle exec pod update || true
    bundle exec pod install && return 0
  fi
  pod repo update || true
  pod update || true
  pod install && return 0
  return 1
}

# Execution strategy:
# 1. Primary: bundle exec pod install
# 2. Secondary fallback: system pod install
# 3. Tertiary fallback: pod repo update / pod update -> pod install
if runPodInstallWithBundler; then
  echo "Successfully completed CocoaPods installation with Bundler."
elif runPodInstallSystem; then
  echo "Successfully completed CocoaPods installation with system pod."
elif runPodInstallFallback; then
  echo "Successfully completed CocoaPods installation with fallback update."
else
  echo "Error: All CocoaPods installation attempts failed!" >&2
  exit 1
fi

echo "===== ci_post_clone.sh completed successfully ====="
