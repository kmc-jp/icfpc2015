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

bool is_movable(const table<bool> &b, const Unit &u);
