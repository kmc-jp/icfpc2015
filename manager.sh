#!/bin/sh
ruby inputter.rb $@ | ./solver | ruby outputter.rb
