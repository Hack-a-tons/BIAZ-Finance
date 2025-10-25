#!/usr/bin/env bash

cd ~/BIAZ-Finance
./scripts/cleanup-db.sh >> logs/cleanup.log 2>&1
