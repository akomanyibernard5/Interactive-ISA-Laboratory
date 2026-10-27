#include "Types.hpp"
#include <sstream>
#include <iomanip>

namespace iil {

std::string executionStatusToString(ExecutionStatus status) {
    switch (status) {
        case ExecutionStatus::Idle:    return "idle";
        case ExecutionStatus::Running: return "running";
        case ExecutionStatus::Paused:  return "paused";
        case ExecutionStatus::Halted:  return "halted";
        case ExecutionStatus::Error:   return "error";
        default:                       return "unknown";
    }
}

std::string memoryAccessTypeToString(MemoryAccessType type) {
    return type == MemoryAccessType::Read ? "read" : "write";
}

std::string MemoryChange::addressHex() const {
    std::ostringstream oss;
    oss << "0x" << std::hex << std::setfill('0') << std::setw(4) << address;
    return oss.str();
}

// Cost calculation is deferred until HALT so we don't recompute on every step.
// This matches the frontend's expectation that estimatedCost appears in final metrics.
void ExecutionMetrics::calculateCost(const CostModel& model) {
    estimatedCost = dynamicInstructionCount * model.instructionCost
                  + memoryReads * model.memoryReadCost
                  + memoryWrites * model.memoryWriteCost;
    costModelName = model.name;
}

} // namespace iil
