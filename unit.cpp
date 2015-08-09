#include "def.hpp"
#include "unit.hpp"

bool is_movable(const table &b, const Unit &u) {
  int w=b[0].size(), h=b.size();
  for(P p:u.mem) {
    P b_pos = convert_back(p+u.pivot);
    if (b_pos.x < 0 || b_pos.x >= w ||
        b_pos.y < 0 || b_pos.y >= h) {
      return false;
    }
    if (b[b_pos.y][b_pos.x])
      return false;
  }
  return true;
}

table lock(table b, const Unit &u) {
  for(P p:u.mem) {
    P b_pos = convert_back(p+u.pivot);
    b[b_pos.y][b_pos.x] = true;
  }
  return b;
}

tuple<table, int64_t, int64_t, string> erase(table b, int64_t score, int64_t ls_old,
                                     int unit_size, string com) {
  int ls = 0;
  int w = b[0].size(), h = b.size();
  for(int i=h-1; i >= 0; --i) {
    bool filled = true;
    for (int j=0; j<w; ++j) {
      if (!b[i][j]) filled = false;
    }
    if (filled) {
      for (int j=i-1; j >= 0; --j) {
        b[j+1] = b[j];
      }
      for (int j=0; j<w; ++j) {
        b[0][j] = false;
      }
      --i;
      ++ls;
    }
  }
  int64_t point = unit_size + 100 * (1 + ls) * ls / 2;
  score += point;
  if (ls_old > 1) {
    score += (ls_old - 1) * point / 10;
  }
  return make_tuple(b, score, ls, com);
}

Unit centerize(int w, Unit u) {
  int ymin = 1000000000;
  for (P p:u.mem) {
    p = convert_back(p+u.pivot);
    ymin = min(ymin, p.y);
  }
  int yoff = -ymin;
  u.pivot.y += yoff;
  int xmin = 1000000000;
  int xmax = -1000000000;
  for (P p:u.mem) {
    P q = convert_back(p+u.pivot);
    xmin = min(xmin, q.x);
    xmax = max(xmax, q.x);
  }
  int xoff = (w - (xmax - xmin + 1)) / 2 - xmin;
  u.pivot.x += xoff;
  return u;
}

void update(set<Unit> &s, queue<pair<Unit,string>> &q, Unit u, const string &com) {
  if (!s.count(u)) {
    sort(begin(u.mem), end(u.mem));
    s.insert(u);
    q.push(make_pair(u, com));
  }
}

map<Unit,string> puttable_poses(const table &b, const Unit &u) {
  int w = b[0].size();
  Unit init_u = centerize(w, u);
  set<Unit> movables;
  map<Unit,string> puttables;
  movables.insert(init_u);
  queue<pair<Unit,string>> q;
  q.push(make_pair(init_u, ""));
  while(!q.empty()) {
    Unit nu;
    string com;
    tie(nu, com) = q.front();
    q.pop();
    bool puttable = false;
    char puttable_char = '9';
    if (is_movable_eieiei(b, nu)) {
      update(movables, q, move_ei(nu, -3, 7), com + "5ei!5ei!5ei!5");
    }
    if (is_movable_eiei(b, nu)) {
      update(movables, q, move_ei(nu, -2, 5), com + "5ei!5ei!5");
    }
    if (is_movable_ei(b, nu)) {
      update(movables, q, move_ei(nu, -1, 3), com + "5ei!5");
    }
    if (is_movable_iaia(b, nu)) {
      update(movables, q, move_ei(nu, -6, 6), com + "ia! ia!5");
    }
    if (is_rotatable_c(b, nu)) {
      update(movables, q, rotate_c(nu), com + "d");
    } else {
      puttable_char = 'd';
      puttable = true;
    } if (is_rotatable_ac(b, nu)) {
      update(movables, q, rotate_ac(nu), com + "k");
    } else {
      puttable_char = 'k';
      puttable = true;
    } if (is_movable_sw(b, nu)) {
      update(movables, q, move_sw(nu), com + "a");
    } else {
      puttable_char = 'a';
      puttable = true;
    } if (is_movable_se(b, nu)) {
      update(movables, q, move_se(nu), com + "l");
    } else {
      puttable_char = 'l';
      puttable = true;
    } if (is_movable_w(b, nu)) {
      update(movables, q, move_w(nu), com + "p");
    } else {
      puttable_char = 'p';
      puttable = true;
    } if (is_movable_e(b, nu)) {
      update(movables, q, move_e(nu), com + "b");
    } else {
      puttable_char = 'b';
      puttable = true;
    } if (puttable) {
      assert (puttable_char != '9'); // assertion
      puttables[nu] = com + puttable_char;
    }
  }
  return puttables;
}

vector<tuple<table, int64_t, int64_t, string>> next_states(const table &b,
    const Unit &u, int64_t score, int64_t ls_old) {
  map<Unit,string> movs = puttable_poses(b, u);
  vector<tuple<table, int64_t, int64_t, string>> nexts;
  for (pair<Unit,string> nu : movs) {
    Unit u; string com; tie(u, com) = nu;
    nexts.push_back(erase(lock(b, u), score, ls_old, u.mem.size(), com));
  }
  sort(begin(nexts),end(nexts));
  nexts.erase(unique(begin(nexts),end(nexts)), end(nexts));
  return nexts;
}
