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
  int xoff = (w - (xmax - xmin)) / 2 - xmin;
  u.pivot.x += xoff;
  return u;
}

void update(set<Unit> &s, queue<Unit> &q, const Unit &u) {
  if (!s.count(u)) {
    s.insert(u);
    q.push(u);
  }
}

set<Unit> puttable_poses(const table &b, const Unit &u) {
  int w = b[0].size(), h = b.size();
  Unit init_u = centerize(w, u);
  set<Unit> movables, puttables;
  movables.insert(init_u);
  queue<Unit> q;
  q.push(init_u);
  while(!q.empty()) {
    Unit nu;
    nu = q.front();
    q.pop();
    bool puttable = false;
    if (is_rotatable_c(b, nu)) {
      update(movables, q, rotate_c(nu));
    } else {
      puttable = true;
    } if (is_rotatable_ac(b, nu)) {
      update(movables, q, rotate_ac(nu));
    } else {
      puttable = true;
    } if (is_movable_sw(b, nu)) {
      update(movables, q, move_sw(nu));
    } else {
      puttable = true;
    } if (is_movable_se(b, nu)) {
      update(movables, q, move_se(nu));
    } else {
      puttable = true;
    } if (is_movable_w(b, nu)) {
      update(movables, q, move_w(nu));
    } else {
      puttable = true;
    } if (is_movable_e(b, nu)) {
      update(movables, q, move_e(nu));
    } else {
      puttable = true;
    } if (puttable) {
      puttables.insert(nu);
    }
  }
  return puttables;
}

vector<table> next_states(const table &b, const Unit &u) {
  set<Unit> movs = puttable_poses(b, u);
  vector<table> nexts;
  for (Unit nu : movs) {
    nexts.push_back(erase(lock(b, nu)));
  }
  sort(begin(nexts),end(nexts));
  nexts.erase(unique(begin(nexts),end(nexts)), end(nexts));
  return nexts;
}
