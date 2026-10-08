#pragma once

#include "Types.hpp"
#include <string>
#include <vector>

namespace iil {

// The instruction set is designed to be architecture-neutral: each opcode represents
// a logical operation that can be translated to either register or stack machine code.
// This enables the key research goal: executing the same logical program on both
// architectures for direct comparison.

// LOAD_CONSTANT: Turn an immediate value into a runtime value.
//   Register: LOAD_CONSTANT Rd, #imm   -> Rd = imm
//   Stack:    LOAD_CONSTANT #imm        -> push(imm)
// The immediate is prefixed with '#' in both cases to distinguish from register/variable names.

// LOAD_VARIABLE: Read a variable from data memory.
//   Register: LOAD_VARIABLE Rd, var    -> Rd = mem[var]
//   Stack:    LOAD_VARIABLE var         -> push(mem[var])
// Variable names are symbolic; the VM assigns addresses internally.

// STORE_VARIABLE: Write a value to a named variable in data memory.
//   Register: STORE_VARIABLE var, Rs   -> mem[var] = Rs
//   Stack:    STORE_VARIABLE var        -> mem[var] = pop()
// This is the only way values "escape" from registers or stack into observable memory.

// ADD, SUB, MUL, DIV: Binary arithmetic operations.
//   Register: OP Rd, R1, R2            -> Rd = R1 OP R2
//   Stack:    OP                        -> b = pop(); a = pop(); push(a OP b)
// Stack machines implicitly name their operands by position (top two stack elements).

// COMPARE: Less-than comparison, used for conditionals.
//   Register: COMPARE Rd, R1, R2       -> Rd = (R1 < R2) ? 1 : 0
//   Stack:    COMPARE                   -> b = pop(); a = pop(); push(a < b ? 1 : 0)
// Only less-than is implemented; other comparisons can be derived (e.g., a >= b = !(a < b)).

// LABEL: Marks a position in code that JUMP instructions can reference.
//   Both: LABEL name                    -> PC at this address when jumped to
// Labels are resolved to concrete addresses at load time, not at compile time.

// JUMP: Unconditional control flow change.
//   Both: JUMP label                    -> PC = label's address

// JUMP_IF_ZERO: Conditional control flow (used for if/while statements).
//   Register: JUMP_IF_ZERO Rs, label    -> if (Rs == 0) PC = label; else advance
//   Stack:    JUMP_IF_ZERO label        -> a = pop(); if (a == 0) PC = label

// HALT: Terminates execution normally.
//   Both: HALT                          -> status = Halted

enum class OpCode {
    LOAD_CONSTANT,
    LOAD_VARIABLE,
    STORE_VARIABLE,
    ADD,
    SUB,
    MUL,
    DIV,
    COMPARE,
    LABEL,
    JUMP,
    JUMP_IF_ZERO,
    HALT
};

std::string opCodeToString(OpCode op);
OpCode stringToOpCode(const std::string& str);

// Instruction represents a single operation in memory. The `address` field is the
// location in program memory where this instruction lives, used for PC tracking.
// `operands` are stored as strings to handle both register names ("R3"), immediates
// ("#42"), and labels ("loop_start") uniformly.
struct Instruction {
    uint16_t address = 0;
    OpCode opcode = OpCode::HALT;
    std::vector<std::string> operands;
    std::string encoded;      // Hex representation for display in the UI
    uint8_t sizeBytes = 1;    // Variable-length encoding is common in real ISAs

    Instruction() = default;
    Instruction(uint16_t addr, OpCode op, std::vector<std::string> ops = {},
                std::string enc = "", uint8_t sz = 1);

    std::string toString() const;
    std::string mnemonic() const;
};

// Program is a container for instructions plus metadata. The `architecture` field
// indicates whether this program was generated for Register or Stack VM, which
// determines how operands are interpreted during execution.
struct Program {
    std::string id;
    std::string name;
    std::string description;
    enum class Architecture { Register, Stack } architecture = Architecture::Register;
    std::vector<Instruction> instructions;
    uint32_t totalSizeBytes = 0;

    void calculateTotalSize();
    const Instruction* atAddress(uint16_t addr) const;
    std::optional<uint16_t> findLabel(const std::string& labelName) const;
};

} // namespace iil
