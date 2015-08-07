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

inline Unit rotate_c(Unit u) {
  for(P &p:u.mem) {
    p = rotate(p);
  }
  return u;
}

inline Unit rotate_ac(Unit u) {
  REP(i,5) u = rotate_c(u);
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

inline bool operator==(Unit lhs, Unit rhs) {
  sort(begin(lhs.mem),end(lhs.mem));
  sort(begin(rhs.mem),end(rhs.mem));
  return lhs.mem == rhs.mem && lhs.pivot == rhs.pivot;
}

inline bool operator<(Unit lhs, Unit rhs) {
  sort(begin(lhs.mem),end(lhs.mem));
  sort(begin(rhs.mem),end(rhs.mem));
  return (lhs.mem == rhs.mem) ? lhs.pivot == rhs.pivot : lhs.mem < rhs.mem;
}

table lock(table &b, const Unit &u);

Unit centerize(int w, Unit u);

using res_p = tuple<Unit, int>;
set<res_p> puttable_poses(const table &b, const Unit &u);
