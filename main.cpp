#include <iostream>
#include <vector>
#include <string>

#define REP(i,n) for(int i=0;i<(int)(n); ++i)

using namespace std;
template<typename T>
using line = vector<T>;
template<typename T>
using table = vector<line<T>>;

struct P {
  int x,y;
  P() {}
  P(int x, int y) : x(x), y(y) {}
};

P operator+(P lhs, P rhs) {
  return P(lhs.x+rhs.x, lhs.y+rhs.y);
}

P operator-(P lhs, P rhs) {
  return P(lhs.x-rhs.x, lhs.y-rhs.y);
}

P operator+=(P &lhs, P rhs) {
  return lhs = lhs + rhs;
}

P operator-=(P &lhs, P rhs) {
  return lhs = lhs - rhs;
}

P convert(P p) {
  return P(p.x-p.y/2, p.y);
}

P convert_back(P p) {
  return P(p.x+p.y/2, p.y);
}

struct Unit {
  vector<P> mem;
  P pivot;
};

P rotate(P p, P pivot) {
  p -= pivot;
  P res(-p.y, p.x+p.y);
  return res + pivot;
}

Unit rotate(Unit u) {
  return u;
}

uint64_t rand_next(uint64_t seed) {
  return (seed * 1103515245 + 12345)%UINT64_C(0x100000000);
}

uint32_t get_num(uint32_t val) {
  return val >> 16;
}

string solve(int seed, table<bool> board, vector<Unit> units, int length) {
  vector<int> unit_nums;
  REP(i,length) {
    unit_nums.push_back(get_num(seed)%units.size());
    seed = rand_next(seed);
  }
  return "ok";
}

int main() {
  int time, mem;
  cin>>time>>mem;
  int ph;
  cin>>ph;
  vector<string> phs(ph);
  REP(i,ph) cin>>phs[i];
  int problemId;
  cin>>problemId;
  int h,w;
  cin>>h>>w;
  int n;
  cin>>n;
  vector<int> seeds(n);
  REP(i,n) {
    cin>>seeds[i];
  }
  int m;
  cin>>m;
  vector<Unit> units(m);
  REP(i,m) {
    Unit u;
    int m_num;
    cin>>m_num;
    REP(j,m_num) {
      int x,y;
      cin>>x>>y;
      u.mem.emplace_back(convert(P(x,y)));
    }
    int px,py;
    cin>>px>>py;
    u.pivot = convert(P(px,py));
    units[i] = u;
  }
  table<bool> b(h, line<bool>(w, false));
  REP(i,h){
    string l;
    cin>>l;
    REP(j,w) {
      b[i][j] = (l[j] == '#');
    }
  }
  int length;
  cin>>length;
  cout<<problemId<<endl;
  REP(i,n) {
    cout << solve(seeds[i], b, units, length) << endl;
  }
  return 0;
}
