#!/bin/bash

set -eo pipefail

echo "===== Starting ci_setup.sh (GitHub Actions) ====="

# 1. Resolve repository root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
echo "Repository root: ${REPO_ROOT}"
cd "${REPO_ROOT}"

# 2. Write environment variables to .env
echo "===== Generating .env file ====="
ENV_FILE="${REPO_ROOT}/.env"

cat << EOF > "${ENV_FILE}"
ROLLBAR_API_KEY=${ROLLBAR_API_KEY}
DEVELOPER_EMAIL=${DEVELOPER_EMAIL}
WHATSAPP_USER_GROUP_LINK=${WHATSAPP_USER_GROUP_LINK}
HYMNBOOK_STRIPE_PUBLISHABLE_KEY=${HYMNBOOK_STRIPE_PUBLISHABLE_KEY}
HYMNBOOK_STRIPE_TEST_PUBLISHABLE_KEY=${HYMNBOOK_STRIPE_TEST_PUBLISHABLE_KEY}
EOF

# Warn if critical keys are not set
if [[ -z "${ROLLBAR_API_KEY}" ]]; then
  echo "Warning: ROLLBAR_API_KEY is not defined in GitHub environment/secrets!" >&2
fi

# 3. Check for google-services.json
if [[ -n "${GOOGLE_SERVICES_JSON_BASE64}" ]]; then
  echo "Decoding google-services.json from secret..."
  echo "${GOOGLE_SERVICES_JSON_BASE64}" | base64 --decode > "${REPO_ROOT}/android/app/google-services.json"
fi

if [[ ! -f "${REPO_ROOT}/android/app/google-services.json" ]]; then
  echo "Warning: 'android/app/google-services.json' is not present."
fi

# 4. Decode Android upload keystore if provided in secrets
if [[ -n "${ANDROID_KEYSTORE_BASE64}" ]]; then
  echo "Decoding Android keystore from secret..."
  KEYSTORE_PATH="${REPO_ROOT}/android/app/release.keystore"
  echo "${ANDROID_KEYSTORE_BASE64}" | base64 --decode > "${KEYSTORE_PATH}"
  echo "ANDROID_KEYSTORE_PATH=${KEYSTORE_PATH}" >> "${GITHUB_ENV:-/dev/null}"
fi

# 5. Check and validate version format in package.json
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || true)
echo "Detected package.json version: '${VERSION}'"

# 6. Verify required tools
for cmd in node yarn git; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: Required tool '$cmd' is not installed or not in PATH." >&2
    exit 1
  fi
done

echo "===== ci_setup.sh completed successfully ====="
