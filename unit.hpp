struct P {
  int x,y;
  P() {}
  P(int x, int y) : x(x), y(y) {}
};

inline P operator+(P lhs, P rhs) {
  return P(lhs.x+rhs.x, lhs.y+rhs.y);
}

inline P operator-(P lhs, P rhs) {
  return P(lhs.x-rhs.x, lhs.y-rhs.y);
}

inline P operator+=(P &lhs, P rhs) {
  return lhs = lhs + rhs;
}

inline P operator-=(P &lhs, P rhs) {
  return lhs = lhs - rhs;
}

inline P convert(P p) {
  return P(p.x-p.y/2, p.y);
}

inline P convert_back(P p) {
  if (p.y < 0 && p.y % 2 != 0) return P(p.x+p.y/2-1, p.y);
  return P(p.x+p.y/2, p.y);
}

inline bool operator<(P lhs, P rhs) {
  return (lhs.x == rhs.x) ? (lhs.y < rhs.y) : lhs.x < rhs.x;
}

inline bool operator==(P lhs, P rhs) {
  return lhs.x == rhs.x && lhs.y == rhs.y;
}

inline bool operator!=(P lhs, P rhs) {
  return !(lhs == rhs);
}

struct Unit {
  vector<P> mem;
  P pivot;
};

inline P rotate(P p) {
  P res(-p.y, p.x+p.y);
  return res;
}

inline P rotate_c(P p) {
  P res(p.x+p.y, -p.x);
  return res;
}

inline Unit rotate_c(Unit u) {
  for(P &p:u.mem) {
    p = rotate(p);
  }
  return u;
}

inline Unit rotate_ac(Unit u) {
  for(P &p:u.mem) {
    p = rotate_c(p);
  }
  return u;
}

inline Unit move_sw(Unit u) {
  --u.pivot.x;
  ++u.pivot.y;
  return u;
}

inline Unit move_se(Unit u) {
  ++u.pivot.y;
  return u;
}

inline Unit move_w(Unit u) {
  --u.pivot.x;
  return u;
}

inline Unit move_e(Unit u) {
  ++u.pivot.x;
  return u;
}

inline Unit move_ei(Unit u, int dx, int dy) {
  u.pivot.x += dx;
  u.pivot.y += dy;
  return u;
}

bool is_movable(const table &b, const Unit &u);
inline bool is_rotatable_c(const table &b, const Unit &u) {
  return is_movable(b, rotate_c(u));
}
inline bool is_rotatable_ac(const table &b, const Unit &u) {
  return is_movable(b, rotate_ac(u));
}
inline bool is_movable_sw(const table &b, const Unit &u) {
  return is_movable(b, move_sw(u));
}
inline bool is_movable_se(const table &b, const Unit &u) {
  return is_movable(b, move_se(u));
}
inline bool is_movable_w(const table &b, const Unit &u) {
  return is_movable(b, move_w(u));
}
inline bool is_movable_e(const table &b, const Unit &u) {
  return is_movable(b, move_e(u));
}
inline bool is_movable_ei(const table &b, const Unit &u) {
  return is_movable(b, move_ei(u, 0, 1)) &&
    is_movable(b, move_ei(u, 1, 1)) &&
    is_movable(b, move_ei(u, 0, 2)) &&
    is_movable(b, move_ei(u, -1, 2)) &&
    is_movable(b, move_ei(u, -1, 3));
}
inline bool is_movable_eiei(const table &b, const Unit &u) {
  return is_movable(b, move_ei(u, 0, 1)) &&
    is_movable(b, move_ei(u, 1, 1)) &&
    is_movable(b, move_ei(u, 0, 2)) &&
    is_movable(b, move_ei(u, -1, 2)) &&
    is_movable(b, move_ei(u, -1, 3)) &&
    is_movable(b, move_ei(u, 0, 3)) &&
    is_movable(b, move_ei(u, -1, 4)) &&
    is_movable(b, move_ei(u, -2, 4)) &&
    is_movable(b, move_ei(u, -2, 5));
}
inline bool is_movable_eieiei(const table &b, const Unit &u) {
  return is_movable(b, move_ei(u, 0, 1)) &&
    is_movable(b, move_ei(u, 1, 1)) &&
    is_movable(b, move_ei(u, 0, 2)) &&
    is_movable(b, move_ei(u, -1, 2)) &&
    is_movable(b, move_ei(u, -1, 3)) &&
    is_movable(b, move_ei(u, 0, 3)) &&
    is_movable(b, move_ei(u, -1, 4)) &&
    is_movable(b, move_ei(u, -2, 4)) &&
    is_movable(b, move_ei(u, -2, 5)) &&
    is_movable(b, move_ei(u, -1, 5)) &&
    is_movable(b, move_ei(u, -2, 6)) &&
    is_movable(b, move_ei(u, -3, 6)) &&
    is_movable(b, move_ei(u, -3, 7));
}
inline bool is_movable_iaia(const table &b, const Unit &u) {
  return is_movable(b, move_ei(u, -1, 1)) &&
    is_movable(b, move_ei(u, -2, 2)) &&
    is_movable(b, move_ei(u, -3, 2)) &&
    is_movable(b, move_ei(u, -3, 3)) &&
    is_movable(b, move_ei(u, -4, 4)) &&
    is_movable(b, move_ei(u, -5, 5)) &&
    is_movable(b, move_ei(u, -6, 5)) &&
    is_movable(b, move_ei(u, -6, 6));
}

inline bool operator==(Unit lhs, Unit rhs) {
  sort(begin(lhs.mem),end(lhs.mem));
  sort(begin(rhs.mem),end(rhs.mem));
  return lhs.mem == rhs.mem && lhs.pivot == rhs.pivot;
}

inline bool operator<(Unit lhs, Unit rhs) {
  sort(begin(lhs.mem),end(lhs.mem));
  sort(begin(rhs.mem),end(rhs.mem));
  return (lhs.mem == rhs.mem) ? lhs.pivot < rhs.pivot : lhs.mem < rhs.mem;
}

table lock(table &b, const Unit &u);
table erase(table &b);

Unit centerize(int w, Unit u);

map<Unit,string> puttable_poses(const table &b, const Unit &u);

vector<tuple<table, int64_t, int64_t, string>> next_states(const table &b,
    const Unit &u, int64_t score, int64_t ls_old);
