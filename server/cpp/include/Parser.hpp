#pragma once

#include "IR.hpp"
#include <string>
#include <vector>

namespace iil {

// Lexer token types
enum class TokenType {
    // Keywords
    INT, RETURN, IF, ELSE, WHILE,
    
    // Literals and identifiers
    NUMBER, IDENTIFIER,
    
    // Operators
    PLUS, MINUS, STAR, SLASH,
    ASSIGN,
    EQ, NE, LT, GT, LE, GE,
    
    // Delimiters
    LPAREN, RPAREN,
    LBRACE, RBRACE,
    SEMICOLON, COMMA,
    
    // Special
    END_OF_FILE,
    ERROR
};

std::string tokenTypeToString(TokenType type);

// Token with location info
struct Token {
    TokenType type;
    std::string text;
    int line = 1;
    int column = 1;
    
    std::string toString() const;
};

// Lexer error
struct LexerError {
    std::string message;
    int line;
    int column;
    
    std::string toString() const;
};

// Lexer - converts source to tokens
class Lexer {
public:
    explicit Lexer(const std::string& source);
    
    // Get all tokens (errors stored in errors_)
    std::vector<Token> tokenize();
    
    const std::vector<LexerError>& errors() const { return errors_; }
    bool hasErrors() const { return !errors_.empty(); }
    
private:
    std::string source_;
    size_t pos_;
    int line_;
    int column_;
    std::vector<LexerError> errors_;
    
    char peek() const;
    char peekNext() const;
    char advance();
    void skipWhitespace();
    void skipLineComment();
    
    Token makeToken(TokenType type) const;
    Token errorToken(const std::string& msg);
    Token scanToken();
    Token scanNumber();
    Token scanIdentifier();
};

// Parser error
struct ParserError {
    std::string message;
    int line;
    int column;
    
    std::string toString() const;
};

// Parser - converts tokens to IR
// Supports a minimal C subset:
// - int variable declarations with optional initialization
// - Arithmetic expressions with + - * / and parentheses
// - Assignment statements
// - return statement (optional)
// - if/else statements (optional extension)
// - while loops (optional extension)
class Parser {
public:
    explicit Parser(const std::vector<Token>& tokens);
    
    // Parse program into IR
    std::optional<IRProgram> parse();
    
    const std::vector<ParserError>& errors() const { return errors_; }
    bool hasErrors() const { return !errors_.empty(); }
    
private:
    std::vector<Token> tokens_;
    size_t pos_;
    std::vector<ParserError> errors_;
    int tempCounter_;       // For generating temporaries: t0, t1, ...
    int labelCounter_;      // For generating labels: L0, L1, ...
    
    // Current and lookahead tokens
    const Token& current() const;
    const Token& peek(int offset = 1) const;
    bool isAtEnd() const;
    bool check(TokenType type) const;
    bool match(TokenType type);
    bool expect(TokenType type, const std::string& message);
    
    // Error handling
    void error(const std::string& message);
    void errorAt(const Token& token, const std::string& message);
    
    // Parse functions (recursive descent)
    bool parseProgram(IRProgram& ir);
    bool parseDeclaration(IRProgram& ir);
    bool parseStatement(IRProgram& ir);
    std::optional<std::string> parseExpression(IRProgram& ir);  // Returns temporary holding result
    std::optional<std::string> parseTerm(IRProgram& ir);
    std::optional<std::string> parseFactor(IRProgram& ir);
    
    // Generate unique temporary name
    std::string newTemp() { return "t" + std::to_string(tempCounter_++); }
    
    // Generate unique label
    std::string newLabel() { return "L" + std::to_string(labelCounter_++); }
};

} // namespace iil
