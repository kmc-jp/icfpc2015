require 'json'
require 'open-uri'
# OpenSSL::SSL::VERIFY_PEER = OpenSSL::SSL::VERIFY_NONE
log = nil
loop do
f = open("https://davar.icfpcontest.org/rankings.js").read
j = JSON.parse(f[10..-1])
puts j["time"]
mylog = j["data"]["settings"].
    map{|n| 
      rk = n["rankings"]
      [ rk.select{|r| r["team"] == "KMC"}[0],
        rk.sort_by{|r| r["score"] }[-1] ]
    }
if log != mylog then
updated = false
good = false
mylog.each.with_index{|ns,i|
        n = ns[0]
        printf "%3i|", i
        if n.nil?
        printf "undefined"
        else
        printf(" s:%5i/%6i, p:%2i (%2i)", 
               n["score"],ns[1]["score"],
               n["power_score"], n["rank"])
        end
        if log != nil && log[i][0]["tags"] != mylog[i][0]["tags"] then
            if log[i][0]["score"] < mylog[i][0]["score"]
                printf("[up! ")
                good = true 
            else
                printf("[down ")
            end
            printf("pre:%5i]", log[i][0]["score"])
            updated = true
        end 
        puts ""
    }
    if updated
        if good 
            p "good"
            system('say -v good -r 200 "this was a triumph."')
        else
            system('say -v bad -r 200 "but the no sense crying over every mistake."')
        end
    end
log = mylog
end
sleep 10
end
