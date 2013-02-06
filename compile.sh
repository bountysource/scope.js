#!/bin/bash

if [ $# -eq 0 ]
then
  echo "Usage: $0 0.0.1"
  exit
fi


echo "Squishing: scope-$1.js"
cat src/scope.js \
    src/util.js \
    src/initializers.js \
    src/elements.js \
    src/routes.js \
    src/filters.js \
    src/observers.js \
    src/jsonp.js \
    src/storage.js > scope-$1.js

echo "Compressing: scope-$1.compiled.js"
java -jar ~/Workspace/unattach/vendor/yuicompressor-2.4.6/build/yuicompressor-2.4.6.jar scope-$1.js -o scope-$1.compressed.js --charset utf-8 --nomunge

echo "/* http://scopejs.net/ */" | cat - scope-$1.js > scope-$1.js.tmp && mv scope-$1.js.tmp scope-$1.js
echo "/* http://scopejs.net/ */" | cat - scope-$1.compressed.js > scope-$1.compressed.js.tmp && mv scope-$1.compressed.js.tmp scope-$1.compressed.js
