#pragma once

#include <cstdint>
#include <string>
#include <vector>
#include <optional>

namespace iil {

// 16-bit signed integers are used because the project targets educational
// comparison of register vs stack architectures. A smaller word size makes
// execution traces more readable and keeps the register file compact (8 x 16-bit
// registers = 16 bytes total state). This matches the TypeScript `Value` type
// used in the frontend.
using Value = int16_t;

// 8 registers (R0-R7) is enough to demonstrate register-based execution without
// excessive UI complexity. Real processors have 16-32 general-purpose registers,
// but for educational purposes 8 provides sufficient coverage of register allocation
// concepts while remaining visually manageable.
constexpr size_t NUM_REGISTERS = 8;

// ExecutionStatus mirrors the TypeScript enum exactly so the WebAssembly output
// can be directly serialized to JSON for the React frontend. Using an enum class
// prevents accidental mixing with integer values.
enum class ExecutionStatus {
    Idle,     // No program loaded
    Running,  // Actively executing (for async future use)
    Paused,   // Stopped mid-execution, can resume
    Halted,   // Reached HALT instruction normally
    Error     // Execution stopped due to error (stack underflow, div by zero)
};

std::string executionStatusToString(ExecutionStatus status);

// MemoryAccessType distinguishes reads from writes for metrics comparison.
// Stack VMs typically have fewer explicit memory operations since they use an
// operand stack, but both architectures must access data memory for variables.
enum class MemoryAccessType {
    Read,
    Write
};

std::string memoryAccessTypeToString(MemoryAccessType type);

// MemoryChange records each memory access during execution. The frontend displays
// these in real-time to show how register vs stack architectures differ in their
// memory access patterns. Address is stored as uint16_t to match the 16-bit address
// space model (64KB addressable memory).
struct MemoryChange {
    uint32_t step;
    uint16_t address;
    std::optional<Value> previousValue;  // nullopt for first write to address
    Value newValue;
    MemoryAccessType accessType;

    std::string addressHex() const;
};

// MetricsSnapshot captures cumulative metrics at each execution step. The frontend
// uses this to render execution progression charts showing how instruction count,
// memory operations, and stack depth change over time. This enables visual comparison
// of how both architectures accumulate work.
struct MetricsSnapshot {
    uint32_t instructionCount = 0;
    uint32_t memoryReads = 0;
    uint32_t memoryWrites = 0;
    uint32_t branchCount = 0;
    uint32_t stackPushCount = 0;   // Register VM always reports 0 for these
    uint32_t stackPopCount = 0;
};

// The cost model is intentionally configurable rather than hardcoded. This allows
// experimenting with different assumptions about relative costs of instructions vs
// memory operations. The default values (1/2/3) are pedagogical approximations, not
// based on any specific hardware measurements.
struct CostModel {
    std::string name = "Default Cost Model";
    uint32_t instructionCost = 1;   // Base cost per instruction executed
    uint32_t memoryReadCost = 2;    // Higher than instruction to model memory latency
    uint32_t memoryWriteCost = 3;   // Highest cost to model write-back overhead
};

// ExecutionMetrics aggregates all measurements from a complete or partial run.
// The frontend uses these to populate the metrics panel, comparison charts, and
// experiment results table. `estimatedCost` is computed from the cost model to
// enable discussion of execution efficiency without claiming hardware accuracy.
struct ExecutionMetrics {
    uint32_t programSizeBytes = 0;
    uint32_t dynamicInstructionCount = 0;  // "Dynamic" = total executed, not program size
    uint32_t memoryReads = 0;
    uint32_t memoryWrites = 0;
    uint32_t branchCount = 0;
    uint32_t stackPushCount = 0;
    uint32_t stackPopCount = 0;
    uint32_t estimatedCost = 0;
    std::string costModelName = "Default Cost Model";

    void calculateCost(const CostModel& model);
};

} // namespace iil
