OBJS=main.o unit.o
CXXFLAGS=-Wall -Wextra -O3 -std=c++11

solver: $(OBJS)
	g++ $(CXXFLAGS) -o solver $(OBJS)

.cpp.o:
	g++ $(CXXFLAGS) -c $<

main.cpp: def.hpp unit.hpp
unit.cpp: def.hpp unit.hpp
