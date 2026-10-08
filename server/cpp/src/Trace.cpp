#include "Trace.hpp"
#include <algorithm>

namespace iil {

void ExecutionTrace::addEntry(TraceEntry entry) {
    entries_.push_back(std::move(entry));
}

void ExecutionTrace::clear() {
    entries_.clear();
}

// upToStep is used when the UI is showing a partial execution (paused mid-run).
// The frontend requests the trace and filters to the current step.
std::vector<TraceEntry> ExecutionTrace::upToStep(uint32_t step) const {
    std::vector<TraceEntry> result;
    for (const auto& entry : entries_) {
        if (entry.step <= step) {
            result.push_back(entry);
        }
    }
    return result;
}

const TraceEntry* ExecutionTrace::last() const {
    if (entries_.empty()) return nullptr;
    return &entries_.back();
}

} // namespace iil
