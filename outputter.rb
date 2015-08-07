#!/bin/env ruby
require 'json'
j = []
id = $stdin.gets.to_i
$stdin.each_slice(2){|l|
    j << {"problemId": id, "seed": l[0].to_i, "tag": "KMC", "solution": l[1][0..-2]}
}
p j
puts JSON.generate(j)

