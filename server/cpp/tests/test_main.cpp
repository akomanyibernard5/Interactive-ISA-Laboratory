#include <iostream>
#include <cassert>
#include "../include/Types.hpp"
#include "../include/Instruction.hpp"
#include "../include/Trace.hpp"
#include "../include/vm/RegisterVM.hpp"
#include "../include/vm/StackVM.hpp"

using namespace iil;

// ============================================================================
// Test: Value types and basic operations
// ============================================================================

void test_types() {
    std::cout << "Testing types... ";
    
    // Test Value (16-bit signed)
    Value v = 42;
    assert(v == 42);
    
    // Test MemoryChange
    MemoryChange mc;
    mc.step = 1;
    mc.address = 0x0100;
    mc.newValue = 16;
    mc.accessType = MemoryAccessType::Write;
    assert(mc.addressHex() == "0x0100");
    
    // Test MetricsSnapshot
    MetricsSnapshot snap;
    snap.instructionCount = 5;
    assert(snap.instructionCount == 5);
    
    // Test CostModel
    CostModel model;
    model.instructionCost = 1;
    model.memoryReadCost = 2;
    model.memoryWriteCost = 3;
    
    // Test ExecutionMetrics
    ExecutionMetrics metrics;
    metrics.dynamicInstructionCount = 7;
    metrics.memoryWrites = 1;
    metrics.calculateCost(model);
    assert(metrics.estimatedCost == 7 * 1 + 1 * 3);  // 10
    
    std::cout << "PASSED\n";
}

// ============================================================================
// Test: Instruction and OpCode
// ============================================================================

void test_instruction() {
    std::cout << "Testing instructions... ";
    
    // Test OpCode conversion
    assert(opCodeToString(OpCode::LOAD_CONSTANT) == "LOAD_CONSTANT");
    assert(opCodeToString(OpCode::ADD) == "ADD");
    assert(opCodeToString(OpCode::HALT) == "HALT");
    
    assert(stringToOpCode("LOAD_CONSTANT") == OpCode::LOAD_CONSTANT);
    assert(stringToOpCode("ADD") == OpCode::ADD);
    
    // Test Instruction
    Instruction instr(0x0000, OpCode::LOAD_CONSTANT, {"R1", "#3"}, "0x01 0x01 0x00 0x03", 4);
    assert(instr.address == 0x0000);
    assert(instr.opcode == OpCode::LOAD_CONSTANT);
    assert(instr.operands.size() == 2);
    assert(instr.toString() == "LOAD_CONSTANT R1 #3");
    
    // Test Program
    Program prog;
    prog.id = "test";
    prog.name = "Test Program";
    prog.architecture = Program::Architecture::Register;
    prog.instructions.push_back(instr);
    prog.calculateTotalSize();
    assert(prog.totalSizeBytes == 4);
    
    std::cout << "PASSED\n";
}

// ============================================================================
// Test: Register VM - Basic arithmetic x = (a + b) * c
// ============================================================================

void test_register_vm() {
    std::cout << "Testing Register VM (x = (a+b)*c)... ";
    
    // Create program: x = (3 + 5) * 2 = 16
    Program prog;
    prog.id = "test-reg";
    prog.name = "Register: x = (a+b)*c";
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
    
    // Load and run
    RegisterVM vm;
    CostModel costModel{"Demo Cost Model", 1, 2, 3};
    vm.setCostModel(costModel);
    vm.load(prog);
    
    // Step through execution
    int stepCount = 0;
    while (vm.step()) {
        stepCount++;
        if (stepCount > 100) break;  // Safety limit
    }
    
    // Verify results
    assert(vm.status() == ExecutionStatus::Halted);
    assert(vm.state().getRegister(1) == 3);   // R1 = 3
    assert(vm.state().getRegister(2) == 5);   // R2 = 5
    assert(vm.state().getRegister(3) == 8);   // R3 = 8
    assert(vm.state().getRegister(4) == 2);   // R4 = 2
    assert(vm.state().getRegister(5) == 16);  // R5 = 16
    assert(vm.getVariable("x") == 16);        // x = 16
    
    // Verify metrics
    auto metrics = vm.metrics();
    assert(metrics.dynamicInstructionCount == 7);
    assert(metrics.memoryWrites == 1);
    assert(metrics.estimatedCost == 10);  // 7*1 + 0*2 + 1*3
    
    // Verify trace
    assert(vm.trace().size() == 7);
    
    std::cout << "PASSED\n";
}

// ============================================================================
// Test: Stack VM - Basic arithmetic x = (a + b) * c
// ============================================================================

void test_stack_vm() {
    std::cout << "Testing Stack VM (x = (a+b)*c)... ";
    
    // Create program: x = (3 + 5) * 2 = 16
    Program prog;
    prog.id = "test-stk";
    prog.name = "Stack: x = (a+b)*c";
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
    
    // Load and run
    StackVM vm;
    CostModel costModel{"Demo Cost Model", 1, 2, 3};
    vm.setCostModel(costModel);
    vm.load(prog);
    
    // Run to completion
    vm.run();
    
    // Verify results
    assert(vm.status() == ExecutionStatus::Halted);
    assert(vm.state().empty());               // Stack should be empty
    assert(vm.getVariable("x") == 16);        // x = 16
    
    // Verify metrics
    auto metrics = vm.metrics();
    assert(metrics.dynamicInstructionCount == 7);
    assert(metrics.memoryWrites == 1);
    assert(metrics.stackPushCount == 5);
    assert(metrics.stackPopCount == 5);
    assert(metrics.estimatedCost == 10);  // 7*1 + 0*2 + 1*3
    
    // Verify trace
    assert(vm.trace().size() == 7);
    
    std::cout << "PASSED\n";
}

// ============================================================================
// Test: Both VMs produce equivalent results
// ============================================================================

void test_equivalent_execution() {
    std::cout << "Testing equivalent execution (Register vs Stack)... ";
    
    // Register program
    Program regProg;
    regProg.id = "eq-reg";
    regProg.architecture = Program::Architecture::Register;
    regProg.instructions = {
        {0x0000, OpCode::LOAD_CONSTANT,  {"R1", "#10"}, "", 4},
        {0x0004, OpCode::LOAD_CONSTANT,  {"R2", "#20"}, "", 4},
        {0x0008, OpCode::ADD,            {"R3", "R1", "R2"}, "", 4},
        {0x000C, OpCode::STORE_VARIABLE, {"z", "R3"}, "", 4},
        {0x0010, OpCode::HALT,           {}, "", 2}
    };
    regProg.calculateTotalSize();
    
    // Stack program
    Program stkProg;
    stkProg.id = "eq-stk";
    stkProg.architecture = Program::Architecture::Stack;
    stkProg.instructions = {
        {0x0000, OpCode::LOAD_CONSTANT,  {"#10"}, "", 3},
        {0x0003, OpCode::LOAD_CONSTANT,  {"#20"}, "", 3},
        {0x0006, OpCode::ADD,            {}, "", 1},
        {0x0007, OpCode::STORE_VARIABLE, {"z"}, "", 3},
        {0x000A, OpCode::HALT,           {}, "", 1}
    };
    stkProg.calculateTotalSize();
    
    // Run both
    RegisterVM regVM;
    regVM.load(regProg);
    regVM.run();
    
    StackVM stkVM;
    stkVM.load(stkProg);
    stkVM.run();
    
    // Both should produce z = 30
    assert(regVM.getVariable("z") == 30);
    assert(stkVM.getVariable("z") == 30);
    assert(regVM.getVariable("z") == stkVM.getVariable("z"));
    
    std::cout << "PASSED\n";
}

// ============================================================================
// Test: Reset functionality
// ============================================================================

void test_reset() {
    std::cout << "Testing reset... ";
    
    Program prog;
    prog.instructions = {
        {0x0000, OpCode::LOAD_CONSTANT, {"R1", "#99"}, "", 4},
        {0x0004, OpCode::HALT, {}, "", 2}
    };
    prog.calculateTotalSize();
    
    RegisterVM vm;
    vm.load(prog);
    vm.run();
    
    assert(vm.state().getRegister(1) == 99);
    assert(vm.status() == ExecutionStatus::Halted);
    
    vm.reset();
    
    assert(vm.state().getRegister(1) == 0);
    assert(vm.status() == ExecutionStatus::Paused);
    assert(vm.currentStep() == 0);
    
    std::cout << "PASSED\n";
}

// ============================================================================
// Main test runner
// ============================================================================

int main() {
    std::cout << "\n====================================\n";
    std::cout << "IIL Simulator Test Suite\n";
    std::cout << "====================================\n\n";
    
    test_types();
    test_instruction();
    test_register_vm();
    test_stack_vm();
    test_equivalent_execution();
    test_reset();
    
    std::cout << "\n====================================\n";
    std::cout << "All tests PASSED!\n";
    std::cout << "====================================\n\n";
    
    return 0;
}
