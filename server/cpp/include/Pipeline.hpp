#pragma once

#include "IR.hpp"
#include "Parser.hpp"
#include "CodeGen.hpp"
#include "vm/RegisterVM.hpp"
#include "vm/StackVM.hpp"
#include <string>
#include <optional>

namespace iil {

// Compilation result
struct CompilationResult {
    bool success = false;
    std::string errorMessage;
    
    // Only populated on success
    IRProgram ir;
    std::optional<Program> registerProgram;
    std::optional<Program> stackProgram;
    
    // Error location (if available)
    int errorLine = 0;
    int errorColumn = 0;
};

// Full execution result for one architecture
struct ExecutionResult {
    bool success = false;
    std::string status;
    ExecutionMetrics metrics;
    std::unordered_map<std::string, Value> finalVariables;
    
    // Variable used for result (if return was used)
    std::optional<Value> returnValue;
};

// Complete pipeline result
struct PipelineResult {
    bool compilationSuccess = false;
    std::string compilationError;
    
    std::string irString;
    std::string registerCodeString;
    std::string stackCodeString;
    
    ExecutionResult registerResult;
    ExecutionResult stackResult;
    
    // Comparison
    bool resultsMatch = false;
};

// Pipeline - orchestrates compilation and execution
class Pipeline {
public:
    // Compile source to IR and generate code for both VMs
    CompilationResult compile(const std::string& source);
    
    // Execute both VMs on compiled code
    ExecutionResult executeRegisterVM(const Program& program);
    ExecutionResult executeStackVM(const Program& program);
    
    // Full pipeline: compile and execute
    PipelineResult run(const std::string& source);
    
private:
    CostModel costModel_{"Default Cost Model", 1, 2, 3};
    
    std::string programToString(const Program& prog) const;
    void collectVariables(const RegisterVM& vm, ExecutionResult& result) const;
    void collectVariables(const StackVM& vm, ExecutionResult& result) const;
};

// Helper to format comparison table
std::string formatComparison(const ExecutionMetrics& reg, const ExecutionMetrics& stk);

} // namespace iil
