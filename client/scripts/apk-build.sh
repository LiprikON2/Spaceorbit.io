rm -rf ./android/app/build/outputs/apk/debug > /dev/null
rm -rf ./android/app/build/outputs/apk/release > /dev/null
rm -rf ./android/app/release > /dev/null

read -s -p "Enter keystore password: " keystorepass

npm run prod-build

npx cap build android \
    --keystorepass $keystorepass \
    --keystorepath "../releases/keystore.jks" \
    --keystorealias main \
    --keystorealiaspass $keystorepass \
    --androidreleasetype APK

PACKAGE_VERSION=$(npm pkg get version --workspaces=false | tr -d \")

cp ./android/app/build/outputs/apk/debug/app-debug.apk "./releases/spaceorbit-$PACKAGE_VERSION-debug.apk" 2> /dev/null
cp ./android/app/build/outputs/apk/release/app-release-unsigned.apk "./releases/spaceorbit-$PACKAGE_VERSION-release-unsigned.apk" 2> /dev/null
cp ./android/app/build/outputs/apk/release/app-release-signed.apk "./releases/spaceorbit-$PACKAGE_VERSION-release.apk" 2> /dev/null
cp ./android/app/release/app-release.apk "./releases/spaceorbit-$PACKAGE_VERSION-release.apk" 2> /dev/null