#!/bin/bash

cd android 
. .env.default      
fastlane android detox_build    
