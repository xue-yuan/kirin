#! /bin/bash

pnpm build
cp CNAME ./dist

cd dist/
git init
git add .
git commit -m "Update: $(date)"
git branch -M gh-pages
git push -u -f git@github.com:xue-yuan/kirin gh-pages
