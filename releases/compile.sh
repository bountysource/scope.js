#!/bin/bash

if [ $# -eq 0 ]
then
  echo "Usage: $0 0.0.1"
  exit
fi

echo "Squishing: scope-$1.js"
cat ../source/scope.js \
    ../source/util.js \
    ../source/initializers.js \
    ../source/elements.js \
    ../source/routes.js \
    ../source/filters.js \
    ../source/observers.js \
    ../source/jsonp.js \
    ../source/storage.js > scope-$1.js

echo "Compressing: scope-$1.compiled.js"
java -jar ~/Workspace/unattach/vendor/yuicompressor-2.4.6/build/yuicompressor-2.4.6.jar scope-$1.js -o scope-$1.compressed.js --charset utf-8 --nomunge

echo "/* scope-$1.js -- http://scopejs.net/ */" | cat - scope-$1.js > scope-$1.js.tmp && mv scope-$1.js.tmp scope-$1.js
echo "/* scope-$1.js -- http://scopejs.net/ */" | cat - scope-$1.compressed.js > scope-$1.compressed.js.tmp && mv scope-$1.compressed.js.tmp scope-$1.compressed.js
