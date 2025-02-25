#!/bin/bash
set -e
rm -rf dist
mkdir dist
cp index.html dist/
cp style.css dist/
npm run build
