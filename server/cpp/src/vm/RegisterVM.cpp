#include "vm/RegisterVM.hpp"
#include <sstream>
#include <iomanip>
#include <stdexcept>

namespace iil {

Value RegisterVMState::getRegister(size_t index) const {
    if (index >= NUM_REGISTERS) return 0;
    return registers[index];
}

void RegisterVMState::setRegister(size_t index, Value value) {
    if (index < NUM_REGISTERS) {
        registers[index] = value;
    }
}

// State string format: "R0=0, R1=3, R2=5, ..." for display in the trace UI
std::string RegisterVMState::toString() const {
    std::ostringstream oss;
    for (size_t i = 0; i < NUM_REGISTERS; ++i) {
        if (i > 0) oss << ", ";
        oss << "R" << i << "=" << registers[i];
    }
    return oss.str();
}

void RegisterVM::load(const Program& program) {
    program_ = &program;
    reset();
    metrics_.programSizeBytes = program.totalSizeBytes;
    status_ = ExecutionStatus::Paused;  // Ready to run, not yet started
}

void RegisterVM::reset() {
    state_ = RegisterVMState();
    stepCount_ = 0;
    status_ = isLoaded() ? ExecutionStatus::Paused : ExecutionStatus::Idle;
    
    metrics_ = ExecutionMetrics{};
    if (program_) {
        metrics_.programSizeBytes = program_->totalSizeBytes;
    }
    
    trace_.clear();
    memoryChanges_.clear();
    dataMemory_.clear();
    nextDataAddress_ = 0x0100;
}

bool RegisterVM::step() {
    if (!isLoaded() || status_ == ExecutionStatus::Halted || status_ == ExecutionStatus::Error) {
        return false;
    }
    
    // MAX_STEPS prevents infinite loops from hanging the UI or browser
    if (stepCount_ >= MAX_STEPS) {
        status_ = ExecutionStatus::Error;
        return false;
    }
    
    const Instruction* instr = currentInstruction();
    if (!instr) {
        status_ = ExecutionStatus::Error;
        return false;
    }
    
    // Capture state before execution for the trace entry
    TraceEntry traceEntry = createTraceEntry(*instr);
    traceEntry.stateBefore = state_.toString();
    
    // Dispatch to the appropriate execution handler
    switch (instr->opcode) {
        case OpCode::LOAD_CONSTANT:  execLoadConstant(*instr); break;
        case OpCode::LOAD_VARIABLE:  execLoadVariable(*instr); break;
        case OpCode::STORE_VARIABLE: execStoreVariable(*instr); break;
        case OpCode::ADD:            execAdd(*instr); break;
        case OpCode::SUB:            execSub(*instr); break;
        case OpCode::MUL:            execMul(*instr); break;
        case OpCode::DIV:            execDiv(*instr); break;
        case OpCode::COMPARE:        execCompare(*instr); break;
        case OpCode::LABEL:          execLabel(*instr); break;
        case OpCode::JUMP:           execJump(*instr); break;
        case OpCode::JUMP_IF_ZERO:   execJumpIfZero(*instr); break;
        case OpCode::HALT:           execHalt(); break;
    }
    
    // Capture state after execution
    traceEntry.stateAfter = state_.toString();
    traceEntry.memoryChanges = memoryChanges_;
    memoryChanges_.clear();  // Reset for next step
    
    traceEntry.metricsSnapshot = {
        .instructionCount = metrics_.dynamicInstructionCount,
        .memoryReads = metrics_.memoryReads,
        .memoryWrites = metrics_.memoryWrites,
        .branchCount = metrics_.branchCount,
        .stackPushCount = 0,
        .stackPopCount = 0
    };
    
    trace_.addEntry(traceEntry);
    stepCount_++;
    
    return status_ != ExecutionStatus::Halted && status_ != ExecutionStatus::Error;
}

uint32_t RegisterVM::run() {
    uint32_t count = 0;
    while (step() && count < MAX_STEPS) {
        count++;
    }
    return count;
}

const Instruction* RegisterVM::currentInstruction() const {
    if (!program_) return nullptr;
    return program_->atAddress(state_.programCounter);
}

Value RegisterVM::getVariable(const std::string& name) const {
    auto it = dataMemory_.find(name);
    return it != dataMemory_.end() ? it->second : 0;
}

void RegisterVM::setVariable(const std::string& name, Value value) {
    dataMemory_[name] = value;
}

TraceEntry RegisterVM::createTraceEntry(const Instruction& instr) {
    TraceEntry entry;
    entry.step = stepCount_ + 1;
    entry.programCounter = state_.programCounter;
    entry.instruction = instr;
    return entry;
}

void RegisterVM::recordMemoryChange(uint16_t address, std::optional<Value> prev, 
                                     Value newVal, MemoryAccessType type) {
    MemoryChange change;
    change.step = stepCount_ + 1;
    change.address = address;
    change.previousValue = prev;
    change.newValue = newVal;
    change.accessType = type;
    memoryChanges_.push_back(change);
    
    // Update metrics for the specific access type
    if (type == MemoryAccessType::Read) {
        metrics_.memoryReads++;
    } else {
        metrics_.memoryWrites++;
    }
}

// Register names are "R0" through "R7" to match the frontend's naming convention
std::optional<size_t> RegisterVM::parseRegister(const std::string& operand) const {
    if (operand.size() >= 2 && (operand[0] == 'R' || operand[0] == 'r')) {
        try {
            size_t reg = std::stoul(operand.substr(1));
            if (reg < NUM_REGISTERS) return reg;
        } catch (...) {}
    }
    return std::nullopt;
}

// Immediates are prefixed with '#' to distinguish from variables/register names
std::optional<Value> RegisterVM::parseImmediate(const std::string& operand) const {
    if (!operand.empty() && operand[0] == '#') {
        try {
            return static_cast<Value>(std::stoi(operand.substr(1)));
        } catch (...) {}
    }
    return std::nullopt;
}

void RegisterVM::execLoadConstant(const Instruction& instr) {
    if (instr.operands.size() < 2) return;
    
    auto rd = parseRegister(instr.operands[0]);
    auto imm = parseImmediate(instr.operands[1]);
    
    if (rd && imm) {
        state_.setRegister(*rd, *imm);
        metrics_.dynamicInstructionCount++;
    }
    
    state_.programCounter += instr.sizeBytes;
}

void RegisterVM::execLoadVariable(const Instruction& instr) {
    if (instr.operands.size() < 2) return;
    
    auto rd = parseRegister(instr.operands[0]);
    const std::string& varName = instr.operands[1];
    
    if (rd) {
        Value val = getVariable(varName);
        state_.setRegister(*rd, val);
        metrics_.dynamicInstructionCount++;
        metrics_.memoryReads++;
    }
    
    state_.programCounter += instr.sizeBytes;
}

void RegisterVM::execStoreVariable(const Instruction& instr) {
    if (instr.operands.size() < 2) return;
    
    const std::string& varName = instr.operands[0];
    auto rs = parseRegister(instr.operands[1]);
    
    if (rs) {
        Value prevVal = getVariable(varName);
        Value newVal = state_.getRegister(*rs);
        setVariable(varName, newVal);
        
        // Assign a unique address for this variable in the data segment
        uint16_t addr = nextDataAddress_++;
        recordMemoryChange(addr, prevVal, newVal, MemoryAccessType::Write);
        metrics_.dynamicInstructionCount++;
    }
    
    state_.programCounter += instr.sizeBytes;
}

void RegisterVM::execAdd(const Instruction& instr) {
    if (instr.operands.size() < 3) return;
    
    auto rd = parseRegister(instr.operands[0]);
    auto r1 = parseRegister(instr.operands[1]);
    auto r2 = parseRegister(instr.operands[2]);
    
    if (rd && r1 && r2) {
        Value result = state_.getRegister(*r1) + state_.getRegister(*r2);
        state_.setRegister(*rd, result);
        metrics_.dynamicInstructionCount++;
    }
    
    state_.programCounter += instr.sizeBytes;
}

void RegisterVM::execSub(const Instruction& instr) {
    if (instr.operands.size() < 3) return;
    
    auto rd = parseRegister(instr.operands[0]);
    auto r1 = parseRegister(instr.operands[1]);
    auto r2 = parseRegister(instr.operands[2]);
    
    if (rd && r1 && r2) {
        Value result = state_.getRegister(*r1) - state_.getRegister(*r2);
        state_.setRegister(*rd, result);
        metrics_.dynamicInstructionCount++;
    }
    
    state_.programCounter += instr.sizeBytes;
}

void RegisterVM::execMul(const Instruction& instr) {
    if (instr.operands.size() < 3) return;
    
    auto rd = parseRegister(instr.operands[0]);
    auto r1 = parseRegister(instr.operands[1]);
    auto r2 = parseRegister(instr.operands[2]);
    
    if (rd && r1 && r2) {
        Value result = state_.getRegister(*r1) * state_.getRegister(*r2);
        state_.setRegister(*rd, result);
        metrics_.dynamicInstructionCount++;
    }
    
    state_.programCounter += instr.sizeBytes;
}

void RegisterVM::execDiv(const Instruction& instr) {
    if (instr.operands.size() < 3) return;
    
    auto rd = parseRegister(instr.operands[0]);
    auto r1 = parseRegister(instr.operands[1]);
    auto r2 = parseRegister(instr.operands[2]);
    
    if (rd && r1 && r2) {
        Value divisor = state_.getRegister(*r2);
        // Division by zero returns 0 rather than crashing; matches typical VM behavior
        if (divisor != 0) {
            Value result = state_.getRegister(*r1) / divisor;
            state_.setRegister(*rd, result);
        }
        metrics_.dynamicInstructionCount++;
    }
    
    state_.programCounter += instr.sizeBytes;
}

void RegisterVM::execCompare(const Instruction& instr) {
    if (instr.operands.size() < 3) return;
    
    auto rd = parseRegister(instr.operands[0]);
    auto r1 = parseRegister(instr.operands[1]);
    auto r2 = parseRegister(instr.operands[2]);
    
    if (rd && r1 && r2) {
        // Compare returns 1 if less-than, 0 otherwise. This enables if/while conditions.
        Value result = (state_.getRegister(*r1) < state_.getRegister(*r2)) ? 1 : 0;
        state_.setRegister(*rd, result);
        metrics_.dynamicInstructionCount++;
    }
    
    state_.programCounter += instr.sizeBytes;
}

void RegisterVM::execLabel(const Instruction& instr) {
    // Labels are no-ops at runtime; they're resolved during jump instruction execution
    metrics_.dynamicInstructionCount++;
    state_.programCounter += instr.sizeBytes;
}

void RegisterVM::execJump(const Instruction& instr) {
    if (instr.operands.size() < 1) return;
    
    const std::string& label = instr.operands[0];
    auto targetAddr = program_->findLabel(label);
    
    if (targetAddr) {
        state_.programCounter = *targetAddr;
    } else {
        // Unknown label: advance PC as a fallback (should not happen in valid programs)
        state_.programCounter += instr.sizeBytes;
    }
    
    metrics_.dynamicInstructionCount++;
    metrics_.branchCount++;
}

void RegisterVM::execJumpIfZero(const Instruction& instr) {
    if (instr.operands.size() < 2) return;
    
    auto rs = parseRegister(instr.operands[0]);
    const std::string& label = instr.operands[1];
    
    if (rs) {
        bool shouldJump = (state_.getRegister(*rs) == 0);
        if (shouldJump) {
            auto targetAddr = program_->findLabel(label);
            if (targetAddr) {
                state_.programCounter = *targetAddr;
            } else {
                state_.programCounter += instr.sizeBytes;
            }
        } else {
            state_.programCounter += instr.sizeBytes;
        }
        metrics_.dynamicInstructionCount++;
        metrics_.branchCount++;
    } else {
        state_.programCounter += instr.sizeBytes;
    }
}

void RegisterVM::execHalt() {
    status_ = ExecutionStatus::Halted;
    metrics_.dynamicInstructionCount++;
    metrics_.calculateCost(costModel_);  // Finalize cost calculation
}

} // namespace iil
