cmake_minimum_required(VERSION 3.16)
project(IISimulator VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Build options
option(IIL_BUILD_TESTS "Build test suite" ON)
option(IIL_BUILD_WASM "Build for WebAssembly with Emscripten" OFF)

# Source files
set(IIL_SOURCES
    src/Types.cpp
    src/Instruction.cpp
    src/Trace.cpp
    src/vm/RegisterVM.cpp
    src/vm/StackVM.cpp
)

# Main library
add_library(iil_simulator STATIC ${IIL_SOURCES})
target_include_directories(iil_simulator PUBLIC include)

# Tests
if(IIL_BUILD_TESTS AND NOT IIL_BUILD_WASM)
    enable_testing()
    add_executable(iil_tests 
        tests/test_main.cpp
    )
    target_link_libraries(iil_tests PRIVATE iil_simulator)
    add_test(NAME IILTests COMMAND iil_tests)
endif()

# Emscripten/WebAssembly target (configured later)
if(IIL_BUILD_WASM)
    # Will be configured when native implementation is working
endif()
