#pragma once

#include "Types.hpp"
#include "Instruction.hpp"
#include "Trace.hpp"
#include <vector>
#include <unordered_map>
#include <optional>

namespace iil {

// StackVMState holds the complete state of the stack machine at any point.
// The operand stack holds intermediate values during expression evaluation.
// Unlike the register file which has fixed size, the stack grows and shrinks
// dynamically during execution. Program counter works the same as in RegisterVM.
struct StackVMState {
    std::vector<Value> stack;
    uint16_t programCounter = 0;

    void push(Value value);
    Value pop();
    Value peek(size_t offset = 0) const;  // offset 0 = top of stack
    size_t size() const { return stack.size(); }
    bool empty() const { return stack.empty(); }
    void clear() { stack.clear(); }
    std::string toString() const;
};

// StackVM implements a 0-address code architecture where operands are implicitly
// taken from the top of the stack. This matches real stack machines like the JVM
// or WebAssembly where instructions operate on an evaluation stack.
//
// Key insight for the research: Stack machines trade execution speed for code
// density. Instructions are shorter because they don't name operands, but each
// operation requires pushing and popping values. This creates more memory traffic
// to/from the stack, but the program itself is smaller.
//
// Example: x = (a + b) * c where a=3, b=5, c=2
//   LOAD_CONSTANT #3    ; 3 bytes: [opcode][#3_high][#3_low]
//   LOAD_CONSTANT #5    ; 3 bytes
//   ADD                 ; 1 byte: no operands needed, operates on stack top
//   LOAD_CONSTANT #2    ; 3 bytes
//   MUL                 ; 1 byte
//   STORE_VARIABLE x    ; 3 bytes
//   HALT                ; 1 byte
//   Total: 15 bytes (vs 26 for register), same 7 instructions, 5 pushes + 5 pops
//
// Note: While the Stack VM has fewer program bytes, it has more runtime stack
// operations. This tradeoff (code size vs execution traffic) is the core research
// question the project explores.

class StackVM {
public:
    static constexpr size_t MAX_STACK_DEPTH = 256;   // Prevent stack overflow
    static constexpr uint32_t MAX_STEPS = 10000;

    StackVM() = default;

    void load(const Program& program);
    void reset();

    bool step();
    uint32_t run();

    const StackVMState& state() const { return state_; }
    ExecutionStatus status() const { return status_; }
    uint32_t currentStep() const { return stepCount_; }
    
    const Instruction* currentInstruction() const;
    ExecutionMetrics metrics() const { return metrics_; }
    const ExecutionTrace& trace() const { return trace_; }
    const std::vector<MemoryChange>& memoryChanges() const { return memoryChanges_; }
    
    Value getVariable(const std::string& name) const;
    void setVariable(const std::string& name, Value value);
    
    bool isLoaded() const { return program_ != nullptr; }
    void setCostModel(const CostModel& model) { costModel_ = model; }

private:
    StackVMState state_;
    ExecutionStatus status_ = ExecutionStatus::Idle;
    uint32_t stepCount_ = 0;
    
    const Program* program_ = nullptr;
    
    ExecutionMetrics metrics_;
    CostModel costModel_;
    
    ExecutionTrace trace_;
    std::vector<MemoryChange> memoryChanges_;
    
    std::unordered_map<std::string, Value> dataMemory_;
    uint16_t nextDataAddress_ = 0x0100;
    
    TraceEntry createTraceEntry(const Instruction& instr);
    void recordMemoryChange(uint16_t address, std::optional<Value> prev, Value newVal, MemoryAccessType type);
    
    void execLoadConstant(const Instruction& instr);
    void execLoadVariable(const Instruction& instr);
    void execStoreVariable(const Instruction& instr);
    void execAdd(const Instruction& instr);
    void execSub(const Instruction& instr);
    void execMul(const Instruction& instr);
    void execDiv(const Instruction& instr);
    void execCompare(const Instruction& instr);
    void execJump(const Instruction& instr);
    void execJumpIfZero(const Instruction& instr);
    void execLabel(const Instruction& instr);
    void execHalt();
    
    std::optional<Value> parseImmediate(const std::string& operand) const;
};

} // namespace iil
