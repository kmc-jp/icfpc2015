#!/bin/env ruby
require 'json'
j = []
until $stdin.eof? do
    id = $stdin.gets.to_i
    $stdin.gets.to_i.times{
        j << {"problemId"=> id, "seed"=> $stdin.gets.to_i, "solution"=> $stdin.gets[0..-2]}
    }
end

puts JSON.generate(j)

