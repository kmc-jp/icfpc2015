#!/bin/env ruby
require 'json'
opt = {f:[],t:[-1],m:[-1],c:[1],p:[]}
opt.default = []
ARGV.each_slice(2){|a|opt[a[0][1].to_sym] << a[1]} unless ARGV.nil?
files = if opt[:f].empty? then [$stdin]
        else opt[:f].map{|f|open(f)} end
js = files.map{|f| JSON.parse(f.read) }
js.each{|j|
units = j["units"].map{|u| u["members"].map{|c| [c["x"],c["y"]]} +
                           [[u["pivot"]["x"],u["pivot"]["y"]]]
                       }
w = j["width"]
h = j["height"]
board = Array.new(h){"."*w}
bcells = j["filled"].each{|c|
    board[c["y"]][c["x"]] = "#"
}
sl = j["sourceLength"]
ss = j["sourceSeeds"]

puts <<"EOS"
#{opt[:t][-1]} #{opt[:m][-1]} #{opt[:c][-1]}
#{opt[:p].length}
#{opt[:p].join("\n")}
#{j["id"]}
#{h} #{w}
#{ss.length} #{ss.join(" ")}
#{units.length}
#{units.map{|u| (u.length-1).to_s+"\n"+u.map{|c|c.join(" ")}.join("\n")}.join("\n")}
#{board.join("\n")}
#{sl}
EOS
}
