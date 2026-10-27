#include "IR.hpp"
#include <algorithm>

namespace iil {

std::string irOpToString(IROpCode op) {
    switch (op) {
        case IROpCode::CONST: return "CONST";
        case IROpCode::LOAD: return "LOAD";
        case IROpCode::STORE: return "STORE";
        case IROpCode::ADD: return "ADD";
        case IROpCode::SUB: return "SUB";
        case IROpCode::MUL: return "MUL";
        case IROpCode::DIV: return "DIV";
        case IROpCode::CMP: return "CMP";
        case IROpCode::LABEL: return "LABEL";
        case IROpCode::JUMP: return "JUMP";
        case IROpCode::JZ: return "JZ";
        case IROpCode::HALT: return "HALT";
    }
    return "UNKNOWN";
}

IRInstruction IRInstruction::Const(const std::string& dest, int32_t value) {
    IRInstruction i(IROpCode::CONST);
    i.dest = dest;
    i.immediate = value;
    return i;
}

IRInstruction IRInstruction::Load(const std::string& dest, const std::string& var) {
    IRInstruction i(IROpCode::LOAD);
    i.dest = dest;
    i.src1 = var;
    return i;
}

IRInstruction IRInstruction::Store(const std::string& var, const std::string& src) {
    IRInstruction i(IROpCode::STORE);
    i.dest = var;
    i.src1 = src;
    return i;
}

IRInstruction IRInstruction::Binary(IROpCode op, const std::string& dest,
                                     const std::string& src1, const std::string& src2) {
    IRInstruction i(op);
    i.dest = dest;
    i.src1 = src1;
    i.src2 = src2;
    return i;
}

IRInstruction IRInstruction::Label(const std::string& name) {
    IRInstruction i(IROpCode::LABEL);
    i.label = name;
    return i;
}

IRInstruction IRInstruction::Jump(const std::string& label) {
    IRInstruction i(IROpCode::JUMP);
    i.label = label;
    return i;
}

IRInstruction IRInstruction::JumpIfZero(const std::string& src, const std::string& label) {
    IRInstruction i(IROpCode::JZ);
    i.src1 = src;
    i.label = label;
    return i;
}

IRInstruction IRInstruction::Halt() {
    return IRInstruction(IROpCode::HALT);
}

std::string IRInstruction::toString() const {
    std::string result = irOpToString(opcode);
    
    switch (opcode) {
        case IROpCode::CONST:
            result += " " + dest + ", #" + std::to_string(immediate);
            break;
        case IROpCode::LOAD:
            result += " " + dest + ", " + src1;
            break;
        case IROpCode::STORE:
            result += " " + dest + ", " + src1;
            break;
        case IROpCode::ADD:
        case IROpCode::SUB:
        case IROpCode::MUL:
        case IROpCode::DIV:
        case IROpCode::CMP:
            result += " " + dest + ", " + src1 + ", " + src2;
            break;
        case IROpCode::LABEL:
            result += " " + label;
            break;
        case IROpCode::JUMP:
            result += " " + label;
            break;
        case IROpCode::JZ:
            result += " " + src1 + ", " + label;
            break;
        case IROpCode::HALT:
            break;
    }
    
    return result;
}

void IRProgram::add(const IRInstruction& instr) {
    instructions.push_back(instr);
}

void IRProgram::addVariable(const std::string& name) {
    if (!hasVariable(name)) {
        variables.push_back(name);
    }
}

bool IRProgram::hasVariable(const std::string& name) const {
    return std::find(variables.begin(), variables.end(), name) != variables.end();
}

std::string IRProgram::toString() const {
    std::string result;
    for (const auto& instr : instructions) {
        result += instr.toString() + "\n";
    }
    return result;
}

std::string IRError::toString() const {
    if (line > 0) {
        return "Error at line " + std::to_string(line) + 
               (column > 0 ? ", col " + std::to_string(column) : "") +
               ": " + message;
    }
    return "Error: " + message;
}

} // namespace iil
