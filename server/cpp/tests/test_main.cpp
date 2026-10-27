#include <iostream>
#include <cassert>
#include "../include/Types.hpp"
#include "../include/Instruction.hpp"
#include "../include/Trace.hpp"
#include "../include/IR.hpp"
#include "../include/Parser.hpp"
#include "../include/CodeGen.hpp"
#include "../include/Pipeline.hpp"
#include "../include/vm/RegisterVM.hpp"
#include "../include/vm/StackVM.hpp"

using namespace iil;

void test_types() {
    std::cout << "Testing types... ";
    
    Value v = 42;
    assert(v == 42);
    
    MemoryChange mc;
    mc.step = 1;
    mc.address = 0x0100;
    mc.newValue = 16;
    mc.accessType = MemoryAccessType::Write;
    assert(mc.addressHex() == "0x0100");
    
    MetricsSnapshot snap;
    snap.instructionCount = 5;
    assert(snap.instructionCount == 5);
    
    CostModel model;
    model.instructionCost = 1;
    model.memoryReadCost = 2;
    model.memoryWriteCost = 3;
    
    ExecutionMetrics metrics;
    metrics.dynamicInstructionCount = 7;
    metrics.memoryWrites = 1;
    metrics.calculateCost(model);
    assert(metrics.estimatedCost == 7 * 1 + 1 * 3);
    
    std::cout << "PASSED\n";
}

void test_instruction() {
    std::cout << "Testing instructions... ";
    
    assert(opCodeToString(OpCode::LOAD_CONSTANT) == "LOAD_CONSTANT");
    assert(opCodeToString(OpCode::ADD) == "ADD");
    assert(opCodeToString(OpCode::HALT) == "HALT");
    
    assert(stringToOpCode("LOAD_CONSTANT") == OpCode::LOAD_CONSTANT);
    assert(stringToOpCode("ADD") == OpCode::ADD);
    
    Instruction instr(0x0000, OpCode::LOAD_CONSTANT, {"R1", "#3"}, "0x01 0x01 0x00 0x03", 4);
    assert(instr.address == 0x0000);
    assert(instr.opcode == OpCode::LOAD_CONSTANT);
    assert(instr.operands.size() == 2);
    assert(instr.toString() == "LOAD_CONSTANT R1 #3");
    
    Program prog;
    prog.id = "test";
    prog.name = "Test Program";
    prog.architecture = Program::Architecture::Register;
    prog.instructions.push_back(instr);
    prog.calculateTotalSize();
    assert(prog.totalSizeBytes == 4);
    
    std::cout << "PASSED\n";
}

void test_register_vm() {
    std::cout << "Testing Register VM (x = (a+b)*c)... ";
    
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
    
    RegisterVM vm;
    CostModel costModel{"Demo Cost Model", 1, 2, 3};
    vm.setCostModel(costModel);
    vm.load(prog);
    
    int stepCount = 0;
    while (vm.step()) {
        stepCount++;
        if (stepCount > 100) break;
    }
    
    assert(vm.status() == ExecutionStatus::Halted);
    assert(vm.state().getRegister(1) == 3);
    assert(vm.state().getRegister(2) == 5);
    assert(vm.state().getRegister(3) == 8);
    assert(vm.state().getRegister(4) == 2);
    assert(vm.state().getRegister(5) == 16);
    assert(vm.getVariable("x") == 16);
    
    auto metrics = vm.metrics();
    assert(metrics.dynamicInstructionCount == 7);
    assert(metrics.memoryWrites == 1);
    assert(metrics.estimatedCost == 10);
    
    assert(vm.trace().size() == 7);
    
    std::cout << "PASSED\n";
}

void test_stack_vm() {
    std::cout << "Testing Stack VM (x = (a+b)*c)... ";
    
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
    
    StackVM vm;
    CostModel costModel{"Demo Cost Model", 1, 2, 3};
    vm.setCostModel(costModel);
    vm.load(prog);
    vm.run();
    
    assert(vm.status() == ExecutionStatus::Halted);
    assert(vm.state().empty());
    assert(vm.getVariable("x") == 16);
    
    auto metrics = vm.metrics();
    assert(metrics.dynamicInstructionCount == 7);
    assert(metrics.memoryWrites == 1);
    assert(metrics.stackPushCount == 5);
    assert(metrics.stackPopCount == 5);
    assert(metrics.estimatedCost == 10);
    
    assert(vm.trace().size() == 7);
    
    std::cout << "PASSED\n";
}

void test_equivalent_execution() {
    std::cout << "Testing equivalent execution (Register vs Stack)... ";
    
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
    
    RegisterVM regVM;
    regVM.load(regProg);
    regVM.run();
    
    StackVM stkVM;
    stkVM.load(stkProg);
    stkVM.run();
    
    assert(regVM.getVariable("z") == 30);
    assert(stkVM.getVariable("z") == 30);
    assert(regVM.getVariable("z") == stkVM.getVariable("z"));
    
    std::cout << "PASSED\n";
}

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

void test_ir() {
    std::cout << "Testing IR... ";
    
    IRProgram ir;
    ir.add(IRInstruction::Const("t0", 42));
    ir.add(IRInstruction::Const("t1", 8));
    ir.add(IRInstruction::Binary(IROpCode::ADD, "t2", "t0", "t1"));
    ir.add(IRInstruction::Store("x", "t2"));
    ir.add(IRInstruction::Halt());
    
    assert(ir.instructions.size() == 5);
    assert(ir.instructions[0].opcode == IROpCode::CONST);
    assert(ir.instructions[0].immediate == 42);
    assert(ir.instructions[2].opcode == IROpCode::ADD);
    assert(ir.instructions[2].dest == "t2");
    
    std::string str = ir.toString();
    assert(str.find("CONST") != std::string::npos);
    assert(str.find("ADD") != std::string::npos);
    
    std::cout << "PASSED\n";
}

void test_lexer() {
    std::cout << "Testing lexer... ";
    
    Lexer lexer("int main() { int x = 42; }");
    auto tokens = lexer.tokenize();
    
    assert(!lexer.hasErrors());
    assert(tokens.size() > 0);
    assert(tokens[0].type == TokenType::INT);
    assert(tokens[1].type == TokenType::IDENTIFIER);
    assert(tokens[1].text == "main");
    
    std::cout << "PASSED\n";
}

void test_parser() {
    std::cout << "Testing parser... ";
    
    Lexer lexer("int main() { int x = 42; }");
    auto tokens = lexer.tokenize();
    assert(!lexer.hasErrors());
    
    Parser parser(tokens);
    auto ir = parser.parse();
    
    assert(ir.has_value());
    assert(!parser.hasErrors());
    assert(ir->instructions.size() >= 2);
    
    std::cout << "PASSED\n";
}

void test_parser_arithmetic() {
    std::cout << "Testing parser arithmetic expressions... ";
    
    Lexer lexer("int main() { int x = 3 + 5 * 2; }");
    auto tokens = lexer.tokenize();
    assert(!lexer.hasErrors());
    
    Parser parser(tokens);
    auto ir = parser.parse();
    
    assert(ir.has_value());
    
    std::cout << "PASSED\n";
}

void runEndToEndTest(const std::string& name, const std::string& source, 
                     const std::string& varName, Value expectedValue) {
    std::cout << "Testing " << name << "... ";
    
    Pipeline pipeline;
    auto result = pipeline.run(source);
    
    if (!result.compilationSuccess) {
        std::cout << "FAILED - Compilation: " << result.compilationError << "\n";
        assert(false);
    }
    
    if (!result.registerResult.success) {
        std::cout << "FAILED - Register VM: " << result.registerResult.status << "\n";
        assert(false);
    }
    
    if (!result.stackResult.success) {
        std::cout << "FAILED - Stack VM: " << result.stackResult.status << "\n";
        assert(false);
    }
    
    auto regIt = result.registerResult.finalVariables.find(varName);
    auto stkIt = result.stackResult.finalVariables.find(varName);
    
    if (regIt == result.registerResult.finalVariables.end()) {
        std::cout << "FAILED - Variable '" << varName << "' not found in Register VM result\n";
        assert(false);
    }
    
    if (stkIt == result.stackResult.finalVariables.end()) {
        std::cout << "FAILED - Variable '" << varName << "' not found in Stack VM result\n";
        assert(false);
    }
    
    if (regIt->second != expectedValue) {
        std::cout << "FAILED - Register VM: expected " << expectedValue 
                  << ", got " << regIt->second << "\n";
        assert(false);
    }
    
    if (stkIt->second != expectedValue) {
        std::cout << "FAILED - Stack VM: expected " << expectedValue 
                  << ", got " << stkIt->second << "\n";
        assert(false);
    }
    
    if (!result.resultsMatch) {
        std::cout << "FAILED - Results don't match between VMs\n";
        assert(false);
    }
    
    std::cout << "PASSED\n";
}

void test_pipeline_test_a() {
    runEndToEndTest("Test A: (3 + 5) * 2 = 16",
        "int main() { int x = (3 + 5) * 2; return x; }", "x", 16);
}

void test_pipeline_test_b() {
    runEndToEndTest("Test B: 3 + 5 * 2 = 13",
        "int main() { int x = 3 + 5 * 2; return x; }", "x", 13);
}

void test_pipeline_test_c() {
    runEndToEndTest("Test C: 10 - 3 = 7",
        "int main() { int x = 10 - 3; return x; }", "x", 7);
}

void test_pipeline_test_d() {
    runEndToEndTest("Test D: a=4, b=6, x=a+b=10",
        "int main() { int a = 4; int b = 6; int x = a + b; return x; }", "x", 10);
}

void test_pipeline_test_e() {
    runEndToEndTest("Test E: (10 - 3) * 2 = 14",
        "int main() { int x = (10 - 3) * 2; return x; }", "x", 14);
}

void test_pipeline_test_f() {
    runEndToEndTest("Test F: 20 / 4 = 5",
        "int main() { int x = 20 / 4; return x; }", "x", 5);
}

void test_pipeline_error_handling() {
    std::cout << "Testing error handling... ";
    
    Pipeline pipeline;
    
    auto result1 = pipeline.run("int main() { int x = ; }");
    assert(!result1.compilationSuccess);
    
    std::cout << "PASSED\n";
}

void test_codegen() {
    std::cout << "Testing code generators... ";
    
    IRProgram ir;
    ir.add(IRInstruction::Const("t0", 10));
    ir.add(IRInstruction::Const("t1", 20));
    ir.add(IRInstruction::Binary(IROpCode::ADD, "t2", "t0", "t1"));
    ir.add(IRInstruction::Store("z", "t2"));
    ir.add(IRInstruction::Halt());
    
    RegisterVMGenerator regGen;
    auto regProg = regGen.generate(ir);
    assert(regProg.has_value());
    assert(regProg->instructions.size() >= 4);
    
    StackVMGenerator stkGen;
    auto stkProg = stkGen.generate(ir);
    assert(stkProg.has_value());
    assert(stkProg->instructions.size() >= 4);
    
    std::cout << "PASSED\n";
}

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
    
    test_ir();
    
    test_lexer();
    test_parser();
    test_parser_arithmetic();
    
    test_codegen();
    
    test_pipeline_test_a();
    test_pipeline_test_b();
    test_pipeline_test_c();
    test_pipeline_test_d();
    test_pipeline_test_e();
    test_pipeline_test_f();
    test_pipeline_error_handling();
    
    std::cout << "\n====================================\n";
    std::cout << "All tests PASSED!\n";
    std::cout << "====================================\n\n";
    
    return 0;
}
