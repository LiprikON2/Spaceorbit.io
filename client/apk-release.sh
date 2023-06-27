PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | xargs echo -n)

apks=$(find ./releases -maxdepth 1 -name "*$PACKAGE_VERSION*")

gh auth login
gh release create $PACKAGE_VERSION $apks