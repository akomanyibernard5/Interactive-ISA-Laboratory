#include "vm/StackVM.hpp"
#include <sstream>
#include <iomanip>

namespace iil {

void StackVMState::push(Value value) {
    // Stack depth is bounded to prevent memory exhaustion in the browser
    if (stack.size() < StackVM::MAX_STACK_DEPTH) {
        stack.push_back(value);
    }
}

Value StackVMState::pop() {
    if (stack.empty()) return 0;  // Underflow returns 0 instead of crashing
    Value val = stack.back();
    stack.pop_back();
    return val;
}

Value StackVMState::peek(size_t offset) const {
    // Offset 0 looks at top of stack, 1 looks one below, etc.
    if (offset >= stack.size()) return 0;
    return stack[stack.size() - 1 - offset];
}

// State string format: "stack=[3, 5, 8]" for display in the trace UI
std::string StackVMState::toString() const {
    if (stack.empty()) return "stack=[]";
    
    std::ostringstream oss;
    oss << "stack=[";
    for (size_t i = 0; i < stack.size(); ++i) {
        if (i > 0) oss << ", ";
        oss << stack[i];
    }
    oss << "]";
    return oss.str();
}

void StackVM::load(const Program& program) {
    program_ = &program;
    reset();
    metrics_.programSizeBytes = program.totalSizeBytes;
    status_ = ExecutionStatus::Paused;
}

void StackVM::reset() {
    state_.clear();
    state_.programCounter = 0;
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

bool StackVM::step() {
    if (!isLoaded() || status_ == ExecutionStatus::Halted || status_ == ExecutionStatus::Error) {
        return false;
    }
    
    if (stepCount_ >= MAX_STEPS) {
        status_ = ExecutionStatus::Error;
        return false;
    }
    
    const Instruction* instr = currentInstruction();
    if (!instr) {
        status_ = ExecutionStatus::Error;
        return false;
    }
    
    TraceEntry traceEntry = createTraceEntry(*instr);
    traceEntry.stateBefore = state_.toString();
    
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
    
    traceEntry.stateAfter = state_.toString();
    traceEntry.memoryChanges = memoryChanges_;
    memoryChanges_.clear();
    
    // Stack machines track push/pop counts to enable comparison of stack traffic
    // vs register VM's direct register-to-register moves
    traceEntry.metricsSnapshot = {
        .instructionCount = metrics_.dynamicInstructionCount,
        .memoryReads = metrics_.memoryReads,
        .memoryWrites = metrics_.memoryWrites,
        .branchCount = metrics_.branchCount,
        .stackPushCount = metrics_.stackPushCount,
        .stackPopCount = metrics_.stackPopCount
    };
    
    trace_.addEntry(traceEntry);
    stepCount_++;
    
    return status_ != ExecutionStatus::Halted && status_ != ExecutionStatus::Error;
}

uint32_t StackVM::run() {
    uint32_t count = 0;
    while (step() && count < MAX_STEPS) {
        count++;
    }
    return count;
}

const Instruction* StackVM::currentInstruction() const {
    if (!program_) return nullptr;
    return program_->atAddress(state_.programCounter);
}

Value StackVM::getVariable(const std::string& name) const {
    auto it = dataMemory_.find(name);
    return it != dataMemory_.end() ? it->second : 0;
}

void StackVM::setVariable(const std::string& name, Value value) {
    dataMemory_[name] = value;
}

TraceEntry StackVM::createTraceEntry(const Instruction& instr) {
    TraceEntry entry;
    entry.step = stepCount_ + 1;
    entry.programCounter = state_.programCounter;
    entry.instruction = instr;
    return entry;
}

void StackVM::recordMemoryChange(uint16_t address, std::optional<Value> prev, 
                                  Value newVal, MemoryAccessType type) {
    MemoryChange change;
    change.step = stepCount_ + 1;
    change.address = address;
    change.previousValue = prev;
    change.newValue = newVal;
    change.accessType = type;
    memoryChanges_.push_back(change);
    
    if (type == MemoryAccessType::Read) {
        metrics_.memoryReads++;
    } else {
        metrics_.memoryWrites++;
    }
}

std::optional<Value> StackVM::parseImmediate(const std::string& operand) const {
    if (!operand.empty() && operand[0] == '#') {
        try {
            return static_cast<Value>(std::stoi(operand.substr(1)));
        } catch (...) {}
    }
    return std::nullopt;
}

void StackVM::execLoadConstant(const Instruction& instr) {
    if (instr.operands.size() < 1) return;
    
    auto imm = parseImmediate(instr.operands[0]);
    if (imm) {
        state_.push(*imm);
        metrics_.dynamicInstructionCount++;
        metrics_.stackPushCount++;
    }
    
    state_.programCounter += instr.sizeBytes;
}

void StackVM::execLoadVariable(const Instruction& instr) {
    if (instr.operands.size() < 1) return;
    
    const std::string& varName = instr.operands[0];
    Value val = getVariable(varName);
    state_.push(val);
    metrics_.dynamicInstructionCount++;
    metrics_.memoryReads++;
    metrics_.stackPushCount++;
    
    state_.programCounter += instr.sizeBytes;
}

void StackVM::execStoreVariable(const Instruction& instr) {
    if (instr.operands.size() < 1) return;
    
    const std::string& varName = instr.operands[0];
    Value prevVal = getVariable(varName);
    Value newVal = state_.pop();
    setVariable(varName, newVal);
    
    uint16_t addr = nextDataAddress_++;
    recordMemoryChange(addr, prevVal, newVal, MemoryAccessType::Write);
    metrics_.dynamicInstructionCount++;
    metrics_.stackPopCount++;
    
    state_.programCounter += instr.sizeBytes;
}

void StackVM::execAdd(const Instruction& instr) {
    // Stack arithmetic pops two values and pushes one result.
    // This is why stack machines report push/pop counts: each binary operation
    // generates 2 pops and 1 push regardless of the operands.
    if (state_.size() < 2) {
        status_ = ExecutionStatus::Error;  // Stack underflow
        return;
    }
    
    Value b = state_.pop();  // Second operand was pushed last
    Value a = state_.pop();  // First operand was pushed first
    state_.push(a + b);
    
    metrics_.dynamicInstructionCount++;
    metrics_.stackPopCount += 2;
    metrics_.stackPushCount++;
    
    state_.programCounter += instr.sizeBytes;
}

void StackVM::execSub(const Instruction& instr) {
    if (state_.size() < 2) {
        status_ = ExecutionStatus::Error;
        return;
    }
    
    Value b = state_.pop();
    Value a = state_.pop();
    state_.push(a - b);  // a - b, not b - a
    
    metrics_.dynamicInstructionCount++;
    metrics_.stackPopCount += 2;
    metrics_.stackPushCount++;
    
    state_.programCounter += instr.sizeBytes;
}

void StackVM::execMul(const Instruction& instr) {
    if (state_.size() < 2) {
        status_ = ExecutionStatus::Error;
        return;
    }
    
    Value b = state_.pop();
    Value a = state_.pop();
    state_.push(a * b);
    
    metrics_.dynamicInstructionCount++;
    metrics_.stackPopCount += 2;
    metrics_.stackPushCount++;
    
    state_.programCounter += instr.sizeBytes;
}

void StackVM::execDiv(const Instruction& instr) {
    if (state_.size() < 2) {
        status_ = ExecutionStatus::Error;
        return;
    }
    
    Value b = state_.pop();
    Value a = state_.pop();
    // Division by zero returns 0 instead of crashing
    if (b != 0) {
        state_.push(a / b);
    } else {
        state_.push(0);
    }
    
    metrics_.dynamicInstructionCount++;
    metrics_.stackPopCount += 2;
    metrics_.stackPushCount++;
    
    state_.programCounter += instr.sizeBytes;
}

void StackVM::execCompare(const Instruction& instr) {
    if (state_.size() < 2) {
        status_ = ExecutionStatus::Error;
        return;
    }
    
    Value b = state_.pop();
    Value a = state_.pop();
    state_.push(a < b ? 1 : 0);
    
    metrics_.dynamicInstructionCount++;
    metrics_.stackPopCount += 2;
    metrics_.stackPushCount++;
    
    state_.programCounter += instr.sizeBytes;
}

void StackVM::execLabel(const Instruction& instr) {
    metrics_.dynamicInstructionCount++;
    state_.programCounter += instr.sizeBytes;
}

void StackVM::execJump(const Instruction& instr) {
    if (instr.operands.size() < 1) return;
    
    const std::string& label = instr.operands[0];
    auto targetAddr = program_->findLabel(label);
    
    if (targetAddr) {
        state_.programCounter = *targetAddr;
    } else {
        state_.programCounter += instr.sizeBytes;
    }
    
    metrics_.dynamicInstructionCount++;
    metrics_.branchCount++;
}

void StackVM::execJumpIfZero(const Instruction& instr) {
    // Stack-based conditional: pop the condition value, then branch if zero.
    // This differs from register VM where the register is read but not modified.
    if (instr.operands.size() < 1) {
        state_.programCounter += instr.sizeBytes;
        return;
    }
    
    if (state_.empty()) {
        status_ = ExecutionStatus::Error;
        return;
    }
    
    Value a = state_.pop();  // Condition value is consumed
    const std::string& label = instr.operands[0];
    
    bool shouldJump = (a == 0);
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
    metrics_.stackPopCount++;
}

void StackVM::execHalt() {
    status_ = ExecutionStatus::Halted;
    metrics_.dynamicInstructionCount++;
    metrics_.calculateCost(costModel_);
}

} // namespace iil
