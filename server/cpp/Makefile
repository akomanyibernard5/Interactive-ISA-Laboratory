# Makefile for IIL Simulator
# Use: make          - build the library, tests, and runner
#      make run      - run the demo executable
#      make test     - run tests
#      make clean    - remove build artifacts

CXX = clang++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2 -I./include

SRCDIR = src
INCDIR = include
TESTDIR = tests
BUILDDIR = build

# Source files
SOURCES = $(SRCDIR)/Types.cpp \
          $(SRCDIR)/Instruction.cpp \
          $(SRCDIR)/Trace.cpp \
          $(SRCDIR)/vm/RegisterVM.cpp \
          $(SRCDIR)/vm/StackVM.cpp

OBJECTS = $(patsubst $(SRCDIR)/%.cpp,$(BUILDDIR)/%.o,$(SOURCES))

# Targets
LIB = $(BUILDDIR)/libiil.a
TEST = $(BUILDDIR)/iil_tests
RUNNER = $(BUILDDIR)/iil_runner

.PHONY: all run test clean

all: $(LIB) $(TEST) $(RUNNER)

$(BUILDDIR):
	mkdir -p $(BUILDDIR)/vm

$(BUILDDIR)/%.o: $(SRCDIR)/%.cpp | $(BUILDDIR)
	$(CXX) $(CXXFLAGS) -c $< -o $@

$(BUILDDIR)/vm/%.o: $(SRCDIR)/vm/%.cpp | $(BUILDDIR)
	$(CXX) $(CXXFLAGS) -c $< -o $@

$(LIB): $(OBJECTS)
	ar rcs $@ $^

$(TEST): $(TESTDIR)/test_main.cpp $(LIB)
	$(CXX) $(CXXFLAGS) $< -L$(BUILDDIR) -liil -o $@

$(RUNNER): $(SRCDIR)/main.cpp $(LIB)
	$(CXX) $(CXXFLAGS) $< -L$(BUILDDIR) -liil -o $@

run: $(RUNNER)
	./$(RUNNER)

test: $(TEST)
	./$(TEST)

clean:
	rm -rf $(BUILDDIR)
