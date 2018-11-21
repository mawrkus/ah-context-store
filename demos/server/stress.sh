#!/bin/bash
while true ;
do
  curl -H "user-agent:$1" http://localhost:3030/demo;
  sleep 0.2;
done
