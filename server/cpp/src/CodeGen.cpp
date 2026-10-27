#include "CodeGen.hpp"
#include <unordered_map>

namespace iil {

RegisterVMGenerator::RegisterVMGenerator() 
    : nextRegister_(0), labelCounter_(0) {}

std::optional<int> RegisterVMGenerator::allocateReg(const std::string& temp) {
    if (nextRegister_ >= 8) {
        error_ = CodeGenError{"Register allocation failed: all 8 registers in use. "
                              "Program too complex for current allocator."};
        return std::nullopt;
    }
    int reg = nextRegister_++;
    tempToReg_[temp] = reg;
    return reg;
}

std::optional<int> RegisterVMGenerator::getOrAllocReg(const std::string& temp) {
    auto it = tempToReg_.find(temp);
    if (it != tempToReg_.end()) {
        return it->second;
    }
    return allocateReg(temp);
}

std::optional<Program> RegisterVMGenerator::generate(const IRProgram& ir) {
    error_ = std::nullopt;
    nextRegister_ = 0;
    tempToReg_.clear();
    labelCounter_ = 0;
    
    Program prog;
    prog.id = "reg-vm-output";
    prog.name = "Generated Register VM Program";
    prog.architecture = Program::Architecture::Register;
    
    std::unordered_map<std::string, uint16_t> labelAddresses;
    uint16_t addr = 0x0000;
    
    for (const auto& irInstr : ir.instructions) {
        switch (irInstr.opcode) {
            case IROpCode::LABEL:
                labelAddresses[irInstr.label] = addr;
                prog.instructions.push_back({addr, OpCode::LABEL, {irInstr.label}, "", 0});
                break;
            case IROpCode::CONST: {
                auto reg = getOrAllocReg(irInstr.dest);
                if (!reg) return std::nullopt;
                prog.instructions.push_back({addr, OpCode::LOAD_CONSTANT, 
                    {regName(*reg), "#" + std::to_string(irInstr.immediate)}, "", 4});
                addr += 4;
                break;
            }
            case IROpCode::LOAD: {
                auto reg = getOrAllocReg(irInstr.dest);
                if (!reg) return std::nullopt;
                prog.instructions.push_back({addr, OpCode::LOAD_VARIABLE,
                    {regName(*reg), irInstr.src1}, "", 4});
                addr += 4;
                break;
            }
            case IROpCode::STORE: {
                auto srcReg = getOrAllocReg(irInstr.src1);
                if (!srcReg) return std::nullopt;
                prog.instructions.push_back({addr, OpCode::STORE_VARIABLE,
                    {irInstr.dest, regName(*srcReg)}, "", 4});
                addr += 4;
                break;
            }
            case IROpCode::ADD:
            case IROpCode::SUB:
            case IROpCode::MUL:
            case IROpCode::DIV:
            case IROpCode::CMP: {
                auto destReg = getOrAllocReg(irInstr.dest);
                auto src1Reg = getOrAllocReg(irInstr.src1);
                auto src2Reg = getOrAllocReg(irInstr.src2);
                if (!destReg || !src1Reg || !src2Reg) return std::nullopt;
                
                OpCode op = OpCode::ADD;
                switch (irInstr.opcode) {
                    case IROpCode::ADD: op = OpCode::ADD; break;
                    case IROpCode::SUB: op = OpCode::SUB; break;
                    case IROpCode::MUL: op = OpCode::MUL; break;
                    case IROpCode::DIV: op = OpCode::DIV; break;
                    case IROpCode::CMP: op = OpCode::COMPARE; break;
                    default: break;
                }
                prog.instructions.push_back({addr, op,
                    {regName(*destReg), regName(*src1Reg), regName(*src2Reg)}, "", 4});
                addr += 4;
                break;
            }
            case IROpCode::JUMP:
                prog.instructions.push_back({addr, OpCode::JUMP, {irInstr.label}, "", 4});
                addr += 4;
                break;
            case IROpCode::JZ: {
                auto srcReg = getOrAllocReg(irInstr.src1);
                if (!srcReg) return std::nullopt;
                prog.instructions.push_back({addr, OpCode::JUMP_IF_ZERO,
                    {regName(*srcReg), irInstr.label}, "", 4});
                addr += 4;
                break;
            }
            case IROpCode::HALT:
                prog.instructions.push_back({addr, OpCode::HALT, {}, "", 2});
                addr += 2;
                break;
        }
    }
    
    prog.calculateTotalSize();
    return prog;
}

StackVMGenerator::StackVMGenerator() : labelCounter_(0) {}

std::optional<Program> StackVMGenerator::generate(const IRProgram& ir) {
    error_ = std::nullopt;
    labelCounter_ = 0;
    
    Program prog;
    prog.id = "stack-vm-output";
    prog.name = "Generated Stack VM Program";
    prog.architecture = Program::Architecture::Stack;
    
    uint16_t addr = 0x0000;
    
    for (const auto& irInstr : ir.instructions) {
        switch (irInstr.opcode) {
            case IROpCode::LABEL:
                prog.instructions.push_back({addr, OpCode::LABEL, {irInstr.label}, "", 0});
                break;
            case IROpCode::CONST:
                prog.instructions.push_back({addr, OpCode::LOAD_CONSTANT,
                    {"#" + std::to_string(irInstr.immediate)}, "", 3});
                addr += 3;
                break;
            case IROpCode::LOAD:
                prog.instructions.push_back({addr, OpCode::LOAD_VARIABLE,
                    {irInstr.src1}, "", 3});
                addr += 3;
                break;
            case IROpCode::STORE:
                prog.instructions.push_back({addr, OpCode::STORE_VARIABLE,
                    {irInstr.dest}, "", 3});
                addr += 3;
                break;
            case IROpCode::ADD:
                prog.instructions.push_back({addr, OpCode::ADD, {}, "", 1});
                addr += 1;
                break;
            case IROpCode::SUB:
                prog.instructions.push_back({addr, OpCode::SUB, {}, "", 1});
                addr += 1;
                break;
            case IROpCode::MUL:
                prog.instructions.push_back({addr, OpCode::MUL, {}, "", 1});
                addr += 1;
                break;
            case IROpCode::DIV:
                prog.instructions.push_back({addr, OpCode::DIV, {}, "", 1});
                addr += 1;
                break;
            case IROpCode::CMP:
                prog.instructions.push_back({addr, OpCode::COMPARE, {}, "", 1});
                addr += 1;
                break;
            case IROpCode::JUMP:
                prog.instructions.push_back({addr, OpCode::JUMP, {irInstr.label}, "", 3});
                addr += 3;
                break;
            case IROpCode::JZ:
                prog.instructions.push_back({addr, OpCode::JUMP_IF_ZERO, {irInstr.label}, "", 3});
                addr += 3;
                break;
            case IROpCode::HALT:
                prog.instructions.push_back({addr, OpCode::HALT, {}, "", 1});
                addr += 1;
                break;
        }
    }
    
    prog.calculateTotalSize();
    return prog;
}

} // namespace iil
