#pragma once

#include "Types.hpp"
#include "Instruction.hpp"
#include "Trace.hpp"
#include <array>
#include <unordered_map>
#include <functional>

namespace iil {

// RegisterVMState holds the complete state of the register machine at any point.
// The register file is an array of 16-bit values. Program counter is the address
// of the next instruction to execute. Data memory maps variable names to values,
// allowing the same source program to use symbolic names regardless of architecture.
struct RegisterVMState {
    std::array<Value, NUM_REGISTERS> registers{};
    uint16_t programCounter = 0;

    RegisterVMState() { registers.fill(0); }

    Value getRegister(size_t index) const;
    void setRegister(size_t index, Value value);
    std::string toString() const;
};

// RegisterVM implements a 3-address code architecture where each instruction explicitly
// names its destination and source operands. This matches real register machines like
// ARM or RISC-V where instructions have the form: OP Rd, Rn, Rm
//
// Key insight for the research: Register machines trade instruction size for reduced
// memory traffic. By keeping values in registers, they avoid repeated loads/stores.
// However, each instruction must encode which registers to use, making instructions
// larger than stack-based equivalents.
//
// Example: x = (a + b) * c where a=3, b=5, c=2
//   LOAD_CONSTANT R1, #3    ; 4 bytes: [opcode][R1][#3_high][#3_low]
//   LOAD_CONSTANT R2, #5    ; 4 bytes
//   ADD R3, R1, R2          ; 4 bytes: explicitly names three registers
//   LOAD_CONSTANT R4, #2    ; 4 bytes
//   MUL R5, R3, R4          ; 4 bytes
//   STORE_VARIABLE x, R5    ; 4 bytes
//   HALT                    ; 2 bytes
//   Total: 26 bytes, 7 instructions, 1 memory write

class RegisterVM {
public:
    static constexpr uint32_t MAX_STEPS = 10000;  // Prevent runaway programs

    RegisterVM() = default;

    void load(const Program& program);
    void reset();

    // step() executes exactly one instruction. Returns true if execution can
    // continue (not halted/error). This enables the UI's single-step feature.
    bool step();
    
    // run() executes until HALT or error. Returns count of instructions executed.
    uint32_t run();

    const RegisterVMState& state() const { return state_; }
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
    RegisterVMState state_;
    ExecutionStatus status_ = ExecutionStatus::Idle;
    uint32_t stepCount_ = 0;
    
    const Program* program_ = nullptr;  // Non-owning reference
    
    ExecutionMetrics metrics_;
    CostModel costModel_;
    
    ExecutionTrace trace_;
    std::vector<MemoryChange> memoryChanges_;  // Cleared after each step
    
    std::unordered_map<std::string, Value> dataMemory_;
    uint16_t nextDataAddress_ = 0x0100;  // Data segment starts at 0x0100
    
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
    
    std::optional<size_t> parseRegister(const std::string& operand) const;
    std::optional<Value> parseImmediate(const std::string& operand) const;
};

} // namespace iil
