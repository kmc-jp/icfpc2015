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
