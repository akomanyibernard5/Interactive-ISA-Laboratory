#include <iostream>
#include <iomanip>
#include <sstream>
#include "../include/Instruction.hpp"
#include "../include/vm/RegisterVM.hpp"
#include "../include/vm/StackVM.hpp"
#include "../include/Pipeline.hpp"

using namespace iil;

// Helper to format address as hex
std::string hexAddr(uint16_t addr) {
    std::ostringstream oss;
    oss << "0x" << std::hex << std::setfill('0') << std::setw(4) << addr;
    return oss.str();
}

// Helper to format instruction for display
std::string formatInstruction(const Instruction& instr) {
    std::ostringstream oss;
    oss << hexAddr(instr.address) << ": " << instr.mnemonic();
    for (const auto& op : instr.operands) {
        oss << " " << op;
    }
    return oss.str();
}

void runPipelineDemo(const std::string& name, const std::string& source) {
    std::cout << "\n";
    std::cout << "╔══════════════════════════════════════════════════════════════╗\n";
    std::cout << "║  " << std::left << std::setw(58) << name << " ║\n";
    std::cout << "╚══════════════════════════════════════════════════════════════╝\n\n";
    
    std::cout << "Source:\n";
    std::cout << "  " << source << "\n\n";
    
    Pipeline pipeline;
    auto result = pipeline.run(source);
    
    if (!result.compilationSuccess) {
        std::cout << "COMPILATION ERROR: " << result.compilationError << "\n";
        return;
    }
    
    // Display IR
    std::cout << "--- Intermediate Representation ---\n";
    std::cout << result.irString << "\n";
    
    // Display generated code
    std::cout << "--- Register VM Code ---\n";
    std::cout << result.registerCodeString << "\n";
    
    std::cout << "--- Stack VM Code ---\n";
    std::cout << result.stackCodeString << "\n";
    
    // Results
    std::cout << "--- Execution Results ---\n";
    
    if (result.registerResult.success) {
        std::cout << "Register VM: ";
        for (const auto& [name, val] : result.registerResult.finalVariables) {
            std::cout << name << " = " << val << "  ";
        }
        std::cout << "\n";
    } else {
        std::cout << "Register VM: " << result.registerResult.status << "\n";
    }
    
    if (result.stackResult.success) {
        std::cout << "Stack VM:    ";
        for (const auto& [name, val] : result.stackResult.finalVariables) {
            std::cout << name << " = " << val << "  ";
        }
        std::cout << "\n";
    } else {
        std::cout << "Stack VM: " << result.stackResult.status << "\n";
    }
    
    std::cout << "\n--- Comparison ---\n";
    std::cout << formatComparison(result.registerResult.metrics, result.stackResult.metrics);
    
    if (result.resultsMatch) {
        std::cout << "\n✓ Both VMs produced matching results\n";
    } else {
        std::cout << "\n✗ Results differ between VMs\n";
    }
}

// Original hardcoded demo (kept for reference)
void runOriginalDemo() {
    std::cout << "\n--- Original Hardcoded Demo ---\n";
    
    // Register VM program
    Program prog;
    prog.id = "demo";
    prog.name = "x = (a + b) * c";
    prog.architecture = Program::Architecture::Register;
    prog.instructions = {
        {0x0000, OpCode::LOAD_CONSTANT,  {"R1", "#3"}, "", 4},
        {0x0004, OpCode::LOAD_CONSTANT,  {"R2", "#5"}, "", 4},
        {0x0008, OpCode::ADD,            {"R3", "R1", "R2"}, "", 4},
        {0x000C, OpCode::LOAD_CONSTANT,  {"R4", "#2"}, "", 4},
        {0x0010, OpCode::MUL,            {"R5", "R3", "R4"}, "", 4},
        {0x0014, OpCode::STORE_VARIABLE, {"x", "R5"}, "", 4},
        {0x0018, OpCode::HALT,           {}, "", 2}
    };
    prog.calculateTotalSize();
    
    RegisterVM vm;
    CostModel costModel{"Demo Cost Model", 1, 2, 3};
    vm.setCostModel(costModel);
    vm.load(prog);
    vm.run();
    
    std::cout << "Register VM result: x = " << vm.getVariable("x") << "\n";
    
    // Stack VM program
    Program stkProg;
    stkProg.id = "demo-stack";
    stkProg.name = "x = (a + b) * c";
    stkProg.architecture = Program::Architecture::Stack;
    stkProg.instructions = {
        {0x0000, OpCode::LOAD_CONSTANT,  {"#3"}, "", 3},
        {0x0003, OpCode::LOAD_CONSTANT,  {"#5"}, "", 3},
        {0x0006, OpCode::ADD,            {}, "", 1},
        {0x0007, OpCode::LOAD_CONSTANT,  {"#2"}, "", 3},
        {0x000A, OpCode::MUL,            {}, "", 1},
        {0x000B, OpCode::STORE_VARIABLE, {"x"}, "", 3},
        {0x000E, OpCode::HALT,           {}, "", 1}
    };
    stkProg.calculateTotalSize();
    
    StackVM stkVm;
    stkVm.setCostModel(costModel);
    stkVm.load(stkProg);
    stkVm.run();
    
    std::cout << "Stack VM result: x = " << stkVm.getVariable("x") << "\n";
}

int main() {
    std::cout << "\n";
    std::cout << "╔══════════════════════════════════════════════════════════════╗\n";
    std::cout << "║          INTERACTIVE ISA LABORATORY - BACKEND                ║\n";
    std::cout << "║          C Subset → IR → Register/Stack VM Pipeline           ║\n";
    std::cout << "╚══════════════════════════════════════════════════════════════╝\n";
    
    // Test suite from task specification
    runPipelineDemo("Test A: Arithmetic and precedence",
        "int main() { int x = (3 + 5) * 2; return x; }");
    
    runPipelineDemo("Test B: Operator precedence",
        "int main() { int x = 3 + 5 * 2; return x; }");
    
    runPipelineDemo("Test C: Subtraction",
        "int main() { int x = 10 - 3; return x; }");
    
    runPipelineDemo("Test D: Multiple assignments",
        "int main() { int a = 4; int b = 6; int x = a + b; return x; }");
    
    runPipelineDemo("Test E: Parentheses",
        "int main() { int x = (10 - 3) * 2; return x; }");
    
    runPipelineDemo("Test F: Division",
        "int main() { int x = 20 / 4; return x; }");
    
    // Original demo for comparison
    runOriginalDemo();
    
    return 0;
}
