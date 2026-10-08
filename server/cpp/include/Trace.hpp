#pragma once

#include "Types.hpp"
#include "Instruction.hpp"
#include <string>
#include <vector>
#include <optional>

namespace iil {

// TraceEntry captures the complete state change from executing one instruction.
// This is the primary data structure for the frontend's execution trace visualization.
// String representations of state are used instead of full state snapshots to reduce
// memory overhead and simplify JSON serialization for the WebAssembly interface.
struct TraceEntry {
    uint32_t step = 0;
    uint16_t programCounter = 0;
    Instruction instruction;
    std::string stateBefore;      // e.g., "R1=3, R2=5, R3=0" or "stack=[3, 5]"
    std::string stateAfter;
    std::vector<MemoryChange> memoryChanges;
    MetricsSnapshot metricsSnapshot;
};

// ExecutionTrace collects all entries from a program run. The frontend requests
// the trace after execution to render the step-by-step view. Traces are stored
// in memory rather than streamed because the UI needs random access for stepping.
class ExecutionTrace {
public:
    void addEntry(TraceEntry entry);
    void clear();

    const std::vector<TraceEntry>& entries() const { return entries_; }
    size_t size() const { return entries_.size(); }
    bool empty() const { return entries_.empty(); }
    
    // Used when replaying execution up to a specific step in the UI
    std::vector<TraceEntry> upToStep(uint32_t step) const;
    const TraceEntry* last() const;

private:
    std::vector<TraceEntry> entries_;
};

} // namespace iil
