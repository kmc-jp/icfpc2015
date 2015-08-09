#include "def.hpp"
#include "unit.hpp"

uint64_t rand_next(uint64_t seed) {
  return (seed * 1103515245 + 12345) % UINT64_C(0x100000000);
}

uint32_t get_num(uint32_t val) {
  return (val >> 16) % (1 << 15);
}

void dump_board(const table &b) {
  for (auto l : b) {
    for (bool p : l) {
      cerr<<p;
    }
    cerr<<endl;
  }
}

const int dx[2][6] = {{1, 0, -1, -1, -1, 0}, {1, 1, 0, -1, 0, 1}};
const int dy[6] = {0, 1, 1, 0, -1, -1};

double eval(table board, int64_t score, int64_t unit_nums) {
  int h = board.size(), w = board[0].size();
  double ev = score * 3;
  if (unit_nums < w * 2) score *= 10;
  if (unit_nums < w / 2) score *= 10;
  REP(i,h) REP(j,w) {
    REP(dir,6) {
      int ni = i + dy[dir], nj = j + dx[i%2][dir];
      if (ni < 0 || nj < 0 || ni >= h || nj >= w) continue;
      if (board[i][j] != board[ni][nj]) {
        if (i % 3 == 0) ev -= 0.1;
        else ev -= 0.2;
      }
    }
  }
  REP(i,h) REP(j,w) {
    if (board[i][j]) ev += 0.5 * i / h;
  }
  return ev;
}

string solve(uint32_t seed, const table &board, const vector<Unit> &units, const int length, const int beam_width) {
  int w = board[0].size();
  vector<int> unit_nums;
  REP(i,length) {
    unit_nums.push_back(get_num(seed)%units.size());
    seed = rand_next(seed);
    //cerr << unit_nums[i] << endl;
  }
  vector<tuple<double, table, int64_t, int64_t, string>> beams;
  beams.emplace_back(0.0, board, 0, 0, "");

  REP(i,length) {
    cerr << "Step: " << i << endl;
    vector<tuple<double, table, int64_t, int64_t, string>> next_beams;
    for (auto tup: beams) {
      double e; table t; int64_t s, ls; string com;
      tie(e, t, s, ls, com) = tup;
      auto nexts = next_states(t, units[unit_nums[i]], s, ls);
      for (auto n: nexts) {
        table nt; int64_t ns, nls; string ncom;
        tie(nt, ns, nls, ncom) = n;
        double ev = eval(nt, ns, length - i);
        if (i == length-1 || is_movable(nt, centerize(w, units[unit_nums[i+1]])))
          next_beams.emplace_back(ev, nt, ns, nls, com + ncom);
        if ((int)next_beams.size() > beam_width) break;
      }
      //cerr << "%% " << next_beams.size() << endl;
      if ((int)next_beams.size() > beam_width) break;
    }
    cerr << "Beam Width A: " << beams.size() << endl;
    cerr << "Beam Width B: " << next_beams.size() << endl;
    if (next_beams.empty()) break;
    beams = next_beams;
    sort(beams.rbegin(), beams.rend());
    for (int i = (int)beams.size() - 2; i >= 0; --i) {
      if (get<1>(beams[i]) == get<1>(beams[i+1])) {
        get<0>(beams[i+1]) = -1000000000000.0;
        get<2>(beams[i+1]) = -1000000000000LL;
      }
    }
    sort(beams.rbegin(), beams.rend());
    if (beams.size() > 300) beams.resize(300);
    /*
    for (auto tup: beams) {
      double e; table t; int64_t score, ls_old; string com;
      tie(e, t, score, ls_old, com) = tup;
      cerr << score << " " << com << endl;
      for (auto l: t) {
        for (auto i: l)
          cerr << (i ? "#" : ".") << " ";
        cerr << endl;
      }
      cerr << endl;
    }
    return "ok";
    */
    double e; table t; int64_t score, ls_old; string com;
    tie(e, t, score, ls_old, com) = beams[0];
    cerr << score << " " << com << endl;
    for (auto l: t) {
      for (auto i: l)
        cerr << (i ? "#" : ".") << " ";
      cerr << endl;
    }
    cerr << endl;
  }
  return get<4>(beams[0]);
}

int main() {
  int time, mem, cores;
  cin>>time>>mem>>cores;
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
  for (int i = 0; i < (int)units.size(); ++i) {
    for (int j = 0; j < (int)units[i].mem.size(); ++j) {
      units[i].mem[j] -= units[i].pivot;
    }
  }
  table b(h, line(w, false));
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
  cout<<n<<endl;
  int beam_width = min(100000, max(100000000 / n / h / w / length, 500));
  REP(i,n) {
    cerr << "BeamWidth: " << beam_width << endl;
    cout << seeds[i] << endl;
    cout << solve(seeds[i], b, units, length, beam_width) << endl;
  }
  return 0;
}
