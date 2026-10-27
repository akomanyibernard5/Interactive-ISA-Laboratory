#pragma once

#include "IR.hpp"
#include "Instruction.hpp"
#include <optional>
#include <unordered_map>

namespace iil {

// Code generation error
struct CodeGenError {
    std::string message;
    
    std::string toString() const { return "CodeGen: " + message; }
};

// Register VM code generator
// Maps IR temporaries to registers R0-R7
class RegisterVMGenerator {
public:
    RegisterVMGenerator();
    
    // Generate Register VM program from IR
    std::optional<Program> generate(const IRProgram& ir);
    
    // Get last error
    const std::optional<CodeGenError>& error() const { return error_; }
    
private:
    std::optional<CodeGenError> error_;
    int nextRegister_;      // Next available register
    int labelCounter_;      // For generating unique labels
    
    // Map temporary names to register numbers
    std::unordered_map<std::string, int> tempToReg_;
    
    // Allocate a register for a temporary
    std::optional<int> allocateReg(const std::string& temp);
    
    // Get or allocate register for a temporary
    std::optional<int> getOrAllocReg(const std::string& temp);
    
    // Resolve label to address (pass 2)
    uint16_t resolveLabel(const std::string& label, 
                          const std::unordered_map<std::string, uint16_t>& labelMap);
    
    std::string regName(int regNum) const {
        return "R" + std::to_string(regNum);
    }
};

// Stack VM code generator
class StackVMGenerator {
public:
    StackVMGenerator();
    
    // Generate Stack VM program from IR
    std::optional<Program> generate(const IRProgram& ir);
    
    const std::optional<CodeGenError>& error() const { return error_; }
    
private:
    std::optional<CodeGenError> error_;
    int labelCounter_;
    
    uint16_t resolveLabel(const std::string& label,
                          const std::unordered_map<std::string, uint16_t>& labelMap);
};

} // namespace iil
