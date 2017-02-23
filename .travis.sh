#!/bin/bash

set -ev

npm run lint
tsc -d
npm run build
npm run test
