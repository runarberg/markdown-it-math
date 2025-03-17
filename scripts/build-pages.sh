#! /bin/bash

mkdir -p pages
cp -r demo pages/
cp index.js pages/

mkdir -p pages/node_modules
cp -r node_modules/{markdown-it,mathup,temml,linkify-it,entities,mdurl,punycode,uc.micro} pages/node_modules/
