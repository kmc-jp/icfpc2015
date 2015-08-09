#!/bin/sh

API_TOKEN="Dh12XLRlbtqQ7UltRXlKX5gzUF0s0vUzrZBIfxEJDrg="
TEAM_ID="107"

date

curl --user :$API_TOKEN -X POST -H "Content-Type: application/json" \
        -d @- \
        https://davar.icfpcontest.org/teams/$TEAM_ID/solutions
