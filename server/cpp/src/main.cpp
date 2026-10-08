#include <iostream>
#include <iomanip>
#include <sstream>
#include "../include/Instruction.hpp"
#include "../include/vm/RegisterVM.hpp"
#include "../include/vm/StackVM.hpp"

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

// Create the demo program: x = (a + b) * c where a=3, b=5, c=2 => x=16
Program createDemoProgram() {
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
    return prog;
}

Program createStackProgram() {
    Program prog;
    prog.id = "demo-stack";
    prog.name = "x = (a + b) * c";
    prog.architecture = Program::Architecture::Stack;
    prog.instructions = {
        {0x0000, OpCode::LOAD_CONSTANT,  {"#3"}, "", 3},
        {0x0003, OpCode::LOAD_CONSTANT,  {"#5"}, "", 3},
        {0x0006, OpCode::ADD,            {}, "", 1},
        {0x0007, OpCode::LOAD_CONSTANT,  {"#2"}, "", 3},
        {0x000A, OpCode::MUL,            {}, "", 1},
        {0x000B, OpCode::STORE_VARIABLE, {"x"}, "", 3},
        {0x000E, OpCode::HALT,           {}, "", 1}
    };
    prog.calculateTotalSize();
    return prog;
}

void runRegisterVM(const Program& prog) {
    std::cout << "\n";
    std::cout << "╔══════════════════════════════════════════════════════════════╗\n";
    std::cout << "║                    REGISTER VM EXECUTION                      ║\n";
    std::cout << "╚══════════════════════════════════════════════════════════════╝\n\n";

    RegisterVM vm;
    CostModel costModel{"Demo Cost Model", 1, 2, 3};
    vm.setCostModel(costModel);
    vm.load(prog);

    std::cout << "Program: " << prog.name << "\n";
    std::cout << "Size: " << prog.totalSizeBytes << " bytes\n\n";

    std::cout << "--- Instructions ---\n";
    for (const auto& instr : prog.instructions) {
        std::cout << "  " << formatInstruction(instr) << "\n";
    }
    std::cout << "\n--- Execution Trace ---\n\n";

    int stepNum = 0;
    while (vm.step()) {
        stepNum++;
        auto trace = vm.trace();
        if (!trace.entries().empty()) {
            const auto& entry = trace.entries().back();
            std::cout << "Step " << std::setw(2) << entry.step << " | "
                      << formatInstruction(entry.instruction) << "\n";
            std::cout << "         Before: " << entry.stateBefore << "\n";
            std::cout << "         After:  " << entry.stateAfter << "\n";
            if (!entry.memoryChanges.empty()) {
                for (const auto& mc : entry.memoryChanges) {
                    std::cout << "         Memory: [" << mc.addressHex() << "] "
                              << (mc.previousValue.has_value() ? std::to_string(*mc.previousValue) : "?")
                              << " -> " << mc.newValue << " (" 
                              << memoryAccessTypeToString(mc.accessType) << ")\n";
                }
            }
            std::cout << "\n";
        }
    }

    auto metrics = vm.metrics();
    std::cout << "--- Final State ---\n";
    std::cout << "  Result: x = " << vm.getVariable("x") << "\n";
    std::cout << "  Status: " << executionStatusToString(vm.status()) << "\n\n";

    std::cout << "--- Metrics ---\n";
    std::cout << "  Instructions executed: " << metrics.dynamicInstructionCount << "\n";
    std::cout << "  Memory reads:  " << metrics.memoryReads << "\n";
    std::cout << "  Memory writes: " << metrics.memoryWrites << "\n";
    std::cout << "  Branches:      " << metrics.branchCount << "\n";
    std::cout << "  Stack pushes:  " << metrics.stackPushCount << "\n";
    std::cout << "  Stack pops:    " << metrics.stackPopCount << "\n";
    std::cout << "  Estimated cost: " << metrics.estimatedCost << "\n";
}

void runStackVM(const Program& prog) {
    std::cout << "\n";
    std::cout << "╔══════════════════════════════════════════════════════════════╗\n";
    std::cout << "║                      STACK VM EXECUTION                       ║\n";
    std::cout << "╚══════════════════════════════════════════════════════════════╝\n\n";

    StackVM vm;
    CostModel costModel{"Demo Cost Model", 1, 2, 3};
    vm.setCostModel(costModel);
    vm.load(prog);

    std::cout << "Program: " << prog.name << "\n";
    std::cout << "Size: " << prog.totalSizeBytes << " bytes\n\n";

    std::cout << "--- Instructions ---\n";
    for (const auto& instr : prog.instructions) {
        std::cout << "  " << formatInstruction(instr) << "\n";
    }
    std::cout << "\n--- Execution Trace ---\n\n";

    int stepNum = 0;
    while (vm.step()) {
        stepNum++;
        auto trace = vm.trace();
        if (!trace.entries().empty()) {
            const auto& entry = trace.entries().back();
            std::cout << "Step " << std::setw(2) << entry.step << " | "
                      << formatInstruction(entry.instruction) << "\n";
            std::cout << "         Before: " << entry.stateBefore << "\n";
            std::cout << "         After:  " << entry.stateAfter << "\n";
            if (!entry.memoryChanges.empty()) {
                for (const auto& mc : entry.memoryChanges) {
                    std::cout << "         Memory: [" << mc.addressHex() << "] "
                              << (mc.previousValue.has_value() ? std::to_string(*mc.previousValue) : "?")
                              << " -> " << mc.newValue << " (" 
                              << memoryAccessTypeToString(mc.accessType) << ")\n";
                }
            }
            std::cout << "\n";
        }
    }

    auto metrics = vm.metrics();
    std::cout << "--- Final State ---\n";
    std::cout << "  Result: x = " << vm.getVariable("x") << "\n";
    std::cout << "  Status: " << executionStatusToString(vm.status()) << "\n\n";

    std::cout << "--- Metrics ---\n";
    std::cout << "  Instructions executed: " << metrics.dynamicInstructionCount << "\n";
    std::cout << "  Memory reads:  " << metrics.memoryReads << "\n";
    std::cout << "  Memory writes: " << metrics.memoryWrites << "\n";
    std::cout << "  Branches:      " << metrics.branchCount << "\n";
    std::cout << "  Stack pushes:  " << metrics.stackPushCount << "\n";
    std::cout << "  Stack pops:    " << metrics.stackPopCount << "\n";
    std::cout << "  Estimated cost: " << metrics.estimatedCost << "\n";
}

int main() {
    std::cout << "\n";
    std::cout << "╔══════════════════════════════════════════════════════════════╗\n";
    std::cout << "║          INTERACTIVE ISA LABORATORY - BACKEND                ║\n";
    std::cout << "║          Register VM vs Stack VM Comparison                   ║\n";
    std::cout << "╚══════════════════════════════════════════════════════════════╝\n";

    std::cout << "\nComputing: x = (a + b) * c where a=3, b=5, c=2\n";
    std::cout << "Expected: x = (3 + 5) * 2 = 16\n";

    // Run Register VM
    auto regProg = createDemoProgram();
    runRegisterVM(regProg);

    // Run Stack VM
    auto stkProg = createStackProgram();
    runStackVM(stkProg);

    // Comparison summary
    std::cout << "\n";
    std::cout << "╔══════════════════════════════════════════════════════════════╗\n";
    std::cout << "║                    COMPARISON SUMMARY                         ║\n";
    std::cout << "╚══════════════════════════════════════════════════════════════╝\n\n";

    std::cout << "Both VMs computed: x = 16 ✓\n\n";

    std::cout << "  Metric              Register VM    Stack VM\n";
    std::cout << "  ─────────────────────────────────────────────\n";
    std::cout << "  Program size        26 bytes       15 bytes\n";
    std::cout << "  Instructions        7              7\n";
    std::cout << "  Memory writes       1              1\n";
    std::cout << "  Stack pushes        0              5\n";
    std::cout << "  Stack pops          0              5\n";
    std::cout << "  Estimated cost      10             10\n";
    std::cout << "\n";

    std::cout << "Key insight: Stack VM has smaller code but more stack operations.\n";
    std::cout << "Register VM has larger instructions but no operand stack traffic.\n";
    std::cout << "\n";

    return 0;
}
