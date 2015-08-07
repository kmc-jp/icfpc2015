#include <iostream>
#include <vector>
#include <string>

#define REP(i,n) for(int i=0;i<(int)(n); ++i)

using namespace std;
template<typename T>
using line = vector<T>;
template<typename T>
using table = vector<line<T>>;

using P = pair<int,int>;

struct Unit {
  vector<P> mem;
  int px, py;
};

string solve(int seed, table<bool> board, vector<Unit> units, int length) {
  return "ok";
}

int main() {
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
      u.mem.emplace_back(x,y);
    }
    cin>>u.px>>u.py;
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
  REP(i,n) {
    cout << solve(seeds[i], b, units, length) << endl;
  }
  return 0;
}
