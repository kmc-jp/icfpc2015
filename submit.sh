#!/bin/sh

API_TOKEN="Dh12XLRlbtqQ7UltRXlKX5gzUF0s0vUzrZBIfxEJDrg="
TEAM_ID="107"

read OUTPUT
echo $OUTPUT

date

curl --user :$API_TOKEN -X POST -H "Content-Type: application/json" \
        -d "$OUTPUT" \
        https://davar.icfpcontest.org/teams/$TEAM_ID/solutions
