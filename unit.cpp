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

table erase(table b) {
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
    }
  }
  return b;
}

Unit centerize(int w, Unit u) {
  int ymin = 1000000000;
  for (P p:u.mem) {
    p = convert_back(p);
    ymin = min(ymin, p.y);
  }
  int yoff = -ymin;
  for (P &p:u.mem) {
    p.y += yoff;
  }
  int xmin = 1000000000;
  int xmax = -1000000000;
  for (P p:u.mem) {
    P q = convert_back(p);
    xmin = min(xmin, q.x);
    xmax = max(xmax, q.x);
  }
  int xoff = (w - (xmax - xmin)) / 2 - xmin;
  for (P &p:u.mem) {
    p = convert_back(p);
    p.x += xoff;
    p = convert(p);
  }
  return u;
}

void update(set<res_p> &s, queue<res_p> &q, const Unit &u, int dir) {
  if (!s.count(make_tuple(u, dir))) {
    s.insert(make_tuple(u, dir));
    q.push(make_tuple(u, dir));
  }
}

set<res_p> puttable_poses(const table &b, const Unit &u) {
  int w = b[0].size(), h = b.size();
  Unit init_u = centerize(w, u);
  set<res_p> movables, puttables;
  movables.insert(make_tuple(init_u, 0));
  queue<res_p> q;
  q.push(make_tuple(init_u, 0));
  while(!q.empty()) {
    Unit nu;
    int dir;
    tie(nu, dir) = q.front();
    q.pop();
    bool puttable = false;
    if (is_rotatable_c(b, nu)) {
      update(movables, q, rotate_c(nu), (dir + 1) % 6);
    } else {
      puttable = true;
    } if (is_rotatable_ac(b, nu)) {
      update(movables, q, rotate_ac(nu), (dir + 5) % 6);
    } else {
      puttable = true;
    } if (is_movable_sw(b, nu)) {
      update(movables, q, move_sw(nu), dir);
    } else {
      puttable = true;
    } if (is_movable_se(b, nu)) {
      update(movables, q, move_se(nu), dir);
    } else {
      puttable = true;
    } if (is_movable_w(b, nu)) {
      update(movables, q, move_w(nu), dir);
    } else {
      puttable = true;
    } if (is_movable_e(b, nu)) {
      update(movables, q, move_e(nu), dir);
    } else {
      puttable = true;
    } if (puttable) {
      puttables.insert(make_tuple(nu, dir));
    }
  }
  return puttables;
}

vector<table> next_states(const table &b, const Unit &u) {
  set<res_p> movs = puttable_poses(b, u);
  vector<table> nexts;
  for (res_p p : movs) {
    nexts.push_back(lock(b, get<0>(p)));
  }
  sort(begin(nexts),end(nexts));
  nexts.erase(unique(begin(nexts),end(nexts)), end(nexts));
  return nexts;
}
