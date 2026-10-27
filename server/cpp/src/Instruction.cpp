#include "Instruction.hpp"
#include <sstream>
#include <iomanip>
#include <algorithm>

namespace iil {

std::string opCodeToString(OpCode op) {
    switch (op) {
        case OpCode::LOAD_CONSTANT:  return "LOAD_CONSTANT";
        case OpCode::LOAD_VARIABLE:  return "LOAD_VARIABLE";
        case OpCode::STORE_VARIABLE: return "STORE_VARIABLE";
        case OpCode::ADD:            return "ADD";
        case OpCode::SUB:            return "SUB";
        case OpCode::MUL:            return "MUL";
        case OpCode::DIV:            return "DIV";
        case OpCode::COMPARE:        return "COMPARE";
        case OpCode::LABEL:          return "LABEL";
        case OpCode::JUMP:           return "JUMP";
        case OpCode::JUMP_IF_ZERO:   return "JUMP_IF_ZERO";
        case OpCode::HALT:           return "HALT";
        default:                     return "UNKNOWN";
    }
}

OpCode stringToOpCode(const std::string& str) {
    if (str == "LOAD_CONSTANT")  return OpCode::LOAD_CONSTANT;
    if (str == "LOAD_VARIABLE")  return OpCode::LOAD_VARIABLE;
    if (str == "STORE_VARIABLE") return OpCode::STORE_VARIABLE;
    if (str == "ADD")            return OpCode::ADD;
    if (str == "SUB")            return OpCode::SUB;
    if (str == "MUL")            return OpCode::MUL;
    if (str == "DIV")            return OpCode::DIV;
    if (str == "COMPARE")        return OpCode::COMPARE;
    if (str == "LABEL")          return OpCode::LABEL;
    if (str == "JUMP")           return OpCode::JUMP;
    if (str == "JUMP_IF_ZERO")   return OpCode::JUMP_IF_ZERO;
    if (str == "HALT")           return OpCode::HALT;
    return OpCode::HALT;  // Default to safe opcode
}

Instruction::Instruction(uint16_t addr, OpCode op, std::vector<std::string> ops,
                         std::string enc, uint8_t sz)
    : address(addr), opcode(op), operands(std::move(ops)),
      encoded(std::move(enc)), sizeBytes(sz) {}

std::string Instruction::toString() const {
    std::ostringstream oss;
    oss << mnemonic();
    for (const auto& op : operands) {
        oss << " " << op;
    }
    return oss.str();
}

std::string Instruction::mnemonic() const {
    return opCodeToString(opcode);
}

void Program::calculateTotalSize() {
    totalSizeBytes = 0;
    for (const auto& instr : instructions) {
        totalSizeBytes += instr.sizeBytes;
    }
}

// Linear search is acceptable because programs are small (dozens of instructions).
// A real compiler would build an address->instruction map at load time.
const Instruction* Program::atAddress(uint16_t addr) const {
    for (const auto& instr : instructions) {
        if (instr.address == addr) return &instr;
    }
    return nullptr;
}

// Labels are resolved at load time by scanning the instruction list.
// This is simpler than maintaining a separate symbol table for our small programs.
std::optional<uint16_t> Program::findLabel(const std::string& labelName) const {
    for (const auto& instr : instructions) {
        if (instr.opcode == OpCode::LABEL && 
            !instr.operands.empty() && 
            instr.operands[0] == labelName) {
            return instr.address;
        }
    }
    return std::nullopt;
}

} // namespace iil
