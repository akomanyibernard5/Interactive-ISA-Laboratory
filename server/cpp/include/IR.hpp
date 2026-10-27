#pragma once

#include "Types.hpp"
#include <string>
#include <vector>
#include <optional>

namespace iil {

// IR Opcode - architecture-neutral operations
enum class IROpCode {
    CONST,      // Load constant: dest = value
    LOAD,       // Load variable: dest = var
    STORE,      // Store variable: var = src
    ADD,        // Addition: dest = src1 + src2
    SUB,        // Subtraction: dest = src1 - src2
    MUL,        // Multiplication: dest = src1 * src2
    DIV,        // Division: dest = src1 / src2
    CMP,        // Compare: dest = (src1 < src2) ? 1 : 0
    LABEL,      // Label marker
    JUMP,       // Unconditional jump
    JZ,         // Jump if zero
    HALT        // Termination
};

std::string irOpToString(IROpCode op);

// IR Instruction - typed with operands
struct IRInstruction {
    IROpCode opcode;
    std::string dest;       // Destination (variable or label)
    std::string src1;       // First source operand
    std::string src2;       // Second source operand
    int32_t immediate = 0;  // Immediate value for CONST
    std::string label;      // Label name for LABEL, JUMP, JZ
    
    IRInstruction(IROpCode op) : opcode(op) {}
    
    // Factory methods for clearer construction
    static IRInstruction Const(const std::string& dest, int32_t value);
    static IRInstruction Load(const std::string& dest, const std::string& var);
    static IRInstruction Store(const std::string& var, const std::string& src);
    static IRInstruction Binary(IROpCode op, const std::string& dest, 
                                  const std::string& src1, const std::string& src2);
    static IRInstruction Label(const std::string& name);
    static IRInstruction Jump(const std::string& label);
    static IRInstruction JumpIfZero(const std::string& src, const std::string& label);
    static IRInstruction Halt();
    
    std::string toString() const;
};

// IR Program - collection of IR instructions with variable tracking
class IRProgram {
public:
    std::vector<IRInstruction> instructions;
    std::vector<std::string> variables;  // All declared variables
    
    void add(const IRInstruction& instr);
    void addVariable(const std::string& name);
    bool hasVariable(const std::string& name) const;
    std::string toString() const;
};

// IR generation error
struct IRError {
    std::string message;
    int line = 0;
    int column = 0;
    
    std::string toString() const;
};

} // namespace iil
