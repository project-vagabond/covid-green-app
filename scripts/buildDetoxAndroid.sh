#!/bin/bash

npx jetify
cd android 
. .env.default      
fastlane android detox_build    
