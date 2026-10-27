#include "Pipeline.hpp"
#include <sstream>
#include <iomanip>

namespace iil {

CompilationResult Pipeline::compile(const std::string& source) {
    CompilationResult result;
    
    Lexer lexer(source);
    auto tokens = lexer.tokenize();
    if (lexer.hasErrors()) {
        result.success = false;
        result.errorMessage = lexer.errors()[0].toString();
        result.errorLine = lexer.errors()[0].line;
        result.errorColumn = lexer.errors()[0].column;
        return result;
    }
    
    Parser parser(tokens);
    auto ir = parser.parse();
    if (!ir) {
        result.success = false;
        if (!parser.errors().empty()) {
            result.errorMessage = parser.errors()[0].toString();
            result.errorLine = parser.errors()[0].line;
            result.errorColumn = parser.errors()[0].column;
        } else {
            result.errorMessage = "Unknown parsing error";
        }
        return result;
    }
    
    result.ir = *ir;
    
    RegisterVMGenerator regGen;
    auto regProg = regGen.generate(*ir);
    if (!regProg) {
        result.success = false;
        result.errorMessage = regGen.error() ? regGen.error()->toString() : "Register VM code generation failed";
        return result;
    }
    result.registerProgram = *regProg;
    
    StackVMGenerator stkGen;
    auto stkProg = stkGen.generate(*ir);
    if (!stkProg) {
        result.success = false;
        result.errorMessage = stkGen.error() ? stkGen.error()->toString() : "Stack VM code generation failed";
        return result;
    }
    result.stackProgram = *stkProg;
    
    result.success = true;
    return result;
}

ExecutionResult Pipeline::executeRegisterVM(const Program& program) {
    ExecutionResult result;
    
    RegisterVM vm;
    vm.setCostModel(costModel_);
    vm.load(program);
    vm.run();
    
    result.success = (vm.status() == ExecutionStatus::Halted);
    result.status = executionStatusToString(vm.status());
    result.metrics = vm.metrics();
    
    collectVariables(vm, result);
    
    return result;
}

ExecutionResult Pipeline::executeStackVM(const Program& program) {
    ExecutionResult result;
    
    StackVM vm;
    vm.setCostModel(costModel_);
    vm.load(program);
    vm.run();
    
    result.success = (vm.status() == ExecutionStatus::Halted);
    result.status = executionStatusToString(vm.status());
    result.metrics = vm.metrics();
    
    collectVariables(vm, result);
    
    return result;
}

PipelineResult Pipeline::run(const std::string& source) {
    PipelineResult result;
    
    auto comp = compile(source);
    if (!comp.success) {
        result.compilationSuccess = false;
        result.compilationError = comp.errorMessage;
        return result;
    }
    
    result.compilationSuccess = true;
    result.irString = comp.ir.toString();
    
    if (comp.registerProgram) {
        result.registerCodeString = programToString(*comp.registerProgram);
    }
    if (comp.stackProgram) {
        result.stackCodeString = programToString(*comp.stackProgram);
    }
    
    if (comp.registerProgram) {
        result.registerResult = executeRegisterVM(*comp.registerProgram);
    }
    if (comp.stackProgram) {
        result.stackResult = executeStackVM(*comp.stackProgram);
    }
    
    if (result.registerResult.success && result.stackResult.success) {
        result.resultsMatch = true;
        for (const auto& [name, value] : result.registerResult.finalVariables) {
            auto it = result.stackResult.finalVariables.find(name);
            if (it == result.stackResult.finalVariables.end() || it->second != value) {
                result.resultsMatch = false;
                break;
            }
        }
    }
    
    return result;
}

std::string Pipeline::programToString(const Program& prog) const {
    std::ostringstream oss;
    for (const auto& instr : prog.instructions) {
        oss << instr.toString() << "\n";
    }
    return oss.str();
}

void Pipeline::collectVariables(const RegisterVM& vm, ExecutionResult& result) const {
    for (const auto& var : {"x", "a", "b", "c", "result", "z"}) {
        Value val = vm.getVariable(var);
        if (val != 0 || var == std::string("result")) {
            result.finalVariables[var] = val;
        }
    }
    if (vm.getVariable("result") != 0) {
        result.returnValue = vm.getVariable("result");
    }
}

void Pipeline::collectVariables(const StackVM& vm, ExecutionResult& result) const {
    for (const auto& var : {"x", "a", "b", "c", "result", "z"}) {
        Value val = vm.getVariable(var);
        if (val != 0 || var == std::string("result")) {
            result.finalVariables[var] = val;
        }
    }
    if (vm.getVariable("result") != 0) {
        result.returnValue = vm.getVariable("result");
    }
}

std::string formatComparison(const ExecutionMetrics& reg, const ExecutionMetrics& stk) {
    std::ostringstream oss;
    oss << std::left;
    oss << std::setw(25) << "Metric" 
        << std::setw(15) << "Register VM"
        << std::setw(15) << "Stack VM" << "\n";
    oss << std::string(55, '-') << "\n";
    
    auto row = [&](const std::string& name, uint32_t regVal, uint32_t stkVal) {
        oss << std::setw(25) << name
            << std::setw(15) << regVal
            << std::setw(15) << stkVal << "\n";
    };
    
    row("Program size (bytes)", reg.programSizeBytes, stk.programSizeBytes);
    row("Instructions executed", reg.dynamicInstructionCount, stk.dynamicInstructionCount);
    row("Memory reads", reg.memoryReads, stk.memoryReads);
    row("Memory writes", reg.memoryWrites, stk.memoryWrites);
    row("Branches", reg.branchCount, stk.branchCount);
    row("Stack pushes", reg.stackPushCount, stk.stackPushCount);
    row("Stack pops", reg.stackPopCount, stk.stackPopCount);
    row("Estimated cost", reg.estimatedCost, stk.estimatedCost);
    
    return oss.str();
}

} // namespace iil
