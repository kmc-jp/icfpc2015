require 'json'
require 'open-uri'
# OpenSSL::SSL::VERIFY_PEER = OpenSSL::SSL::VERIFY_NONE
log = Array.new(24) 
loop do
f = open("https://davar.icfpcontest.org/rankings.js").read
j = JSON.parse(f[10..-1])
puts j["time"]
mylog = j["data"]["settings"].
    map{|n| 
      n["rankings"].select{|r| r["team"] == "KMC"}[0]
    }
if log != mylog then
mylog.each.with_index{|n,i|
        print "#{sprintf("% 3i",i)}| "
        if n.nil?
        print "undefined"
        else
        print "score:#{sprintf("% 5i",n["score"])}, " +
               "power:#{sprintf("% 5i",n["power_score"])} " +
               " (#{n["rank"]})"
        end
        if log[i] == nil || log[i]["tags"] != mylog[i]["tags"] then
            puts "[new]"
        else
            puts ""
        end 
    }
log = mylog
end
sleep 10 
end
