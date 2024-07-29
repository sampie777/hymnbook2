

echo "===== Setting environment variables AGAIN ====="
echo "DEVELOPER_EMAIL=${DEVELOPER_EMAIL}"
echo "ROLLBAR_API_KEY=${ROLLBAR_API_KEY}"
ls -alh
echo "ROLLBAR_API_KEY=${ROLLBAR_API_KEY}" > .env
echo "DEVELOPER_EMAIL=${DEVELOPER_EMAIL}" >> .env
echo "WHATSAPP_USER_GROUP_LINK=${WHATSAPP_USER_GROUP_LINK}" >> .env
echo "== Reading back .env file =="
cat .env