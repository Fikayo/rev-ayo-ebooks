export KEYSTORE_ALIAS=ebookskeystore
export KEYSTORE_PASSWORD=ebooks@keystore 

ng build
cordova build --release android
keytool -importkeystore -srckeystore ebooks.keystore -destkeystore ebooks.keystore -deststoretype pkcs12
cp ebooks.keystore ./platforms/android/app/build/outputs/apk/
cd ./platforms/android/app/build/outputs/apk/
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ebooks.keystore release/app-release-unsigned.apk ebookskeystore
jarsigner -verify -verbose -certs release/app-release-unsigned.apk
zipalign -v 4 release/app-release-unsigned.apk release/ebooks.apk