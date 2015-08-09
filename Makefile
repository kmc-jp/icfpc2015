OBJS=main.o unit.o
CXXFLAGS=-Wall -Wextra -O3 -std=c++11 -lpthread

solver: $(OBJS)
	g++ $(CXXFLAGS) -o solver $(OBJS)

.cpp.o:
	g++ $(CXXFLAGS) -c $<

clean:
	rm solver *.o

main.cpp: def.hpp unit.hpp
unit.cpp: def.hpp unit.hpp
