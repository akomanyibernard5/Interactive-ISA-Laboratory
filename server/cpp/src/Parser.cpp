#include "Parser.hpp"
#include <cctype>
#include <algorithm>

namespace iil {

std::string tokenTypeToString(TokenType type) {
    switch (type) {
        case TokenType::INT: return "INT";
        case TokenType::RETURN: return "RETURN";
        case TokenType::IF: return "IF";
        case TokenType::ELSE: return "ELSE";
        case TokenType::WHILE: return "WHILE";
        case TokenType::NUMBER: return "NUMBER";
        case TokenType::IDENTIFIER: return "IDENTIFIER";
        case TokenType::PLUS: return "PLUS";
        case TokenType::MINUS: return "MINUS";
        case TokenType::STAR: return "STAR";
        case TokenType::SLASH: return "SLASH";
        case TokenType::ASSIGN: return "ASSIGN";
        case TokenType::EQ: return "EQ";
        case TokenType::NE: return "NE";
        case TokenType::LT: return "LT";
        case TokenType::GT: return "GT";
        case TokenType::LE: return "LE";
        case TokenType::GE: return "GE";
        case TokenType::LPAREN: return "LPAREN";
        case TokenType::RPAREN: return "RPAREN";
        case TokenType::LBRACE: return "LBRACE";
        case TokenType::RBRACE: return "RBRACE";
        case TokenType::SEMICOLON: return "SEMICOLON";
        case TokenType::COMMA: return "COMMA";
        case TokenType::END_OF_FILE: return "EOF";
        case TokenType::ERROR: return "ERROR";
    }
    return "UNKNOWN";
}

std::string Token::toString() const {
    return tokenTypeToString(type) + " '" + text + "' at " + 
           std::to_string(line) + ":" + std::to_string(column);
}

std::string LexerError::toString() const {
    return "Lexer error at " + std::to_string(line) + ":" + 
           std::to_string(column) + ": " + message;
}

std::string ParserError::toString() const {
    return "Parser error at " + std::to_string(line) + ":" + 
           std::to_string(column) + ": " + message;
}

Lexer::Lexer(const std::string& source)
    : source_(source), pos_(0), line_(1), column_(1) {}

char Lexer::peek() const {
    return pos_ < source_.size() ? source_[pos_] : '\0';
}

char Lexer::peekNext() const {
    return pos_ + 1 < source_.size() ? source_[pos_ + 1] : '\0';
}

char Lexer::advance() {
    char c = peek();
    pos_++;
    if (c == '\n') {
        line_++;
        column_ = 1;
    } else {
        column_++;
    }
    return c;
}

void Lexer::skipWhitespace() {
    while (pos_ < source_.size()) {
        char c = peek();
        if (c == ' ' || c == '\t' || c == '\r' || c == '\n') {
            advance();
        } else if (c == '/' && peekNext() == '/') {
            skipLineComment();
        } else {
            break;
        }
    }
}

void Lexer::skipLineComment() {
    while (pos_ < source_.size() && peek() != '\n') {
        advance();
    }
}

Token Lexer::makeToken(TokenType type) const {
    return Token{type, std::string(1, source_[pos_ - 1]), line_, column_ - 1};
}

Token Lexer::errorToken(const std::string& msg) {
    errors_.push_back({msg, line_, column_});
    return Token{TokenType::ERROR, msg, line_, column_};
}

Token Lexer::scanNumber() {
    int startLine = line_;
    int startCol = column_;
    std::string num;
    
    while (std::isdigit(peek())) {
        num += advance();
    }
    
    return Token{TokenType::NUMBER, num, startLine, startCol};
}

Token Lexer::scanIdentifier() {
    int startLine = line_;
    int startCol = column_;
    std::string id;
    
    while (std::isalnum(peek()) || peek() == '_') {
        id += advance();
    }
    
    if (id == "int") return {TokenType::INT, id, startLine, startCol};
    if (id == "return") return {TokenType::RETURN, id, startLine, startCol};
    if (id == "if") return {TokenType::IF, id, startLine, startCol};
    if (id == "else") return {TokenType::ELSE, id, startLine, startCol};
    if (id == "while") return {TokenType::WHILE, id, startLine, startCol};
    
    return {TokenType::IDENTIFIER, id, startLine, startCol};
}

Token Lexer::scanToken() {
    skipWhitespace();
    
    if (pos_ >= source_.size()) {
        return {TokenType::END_OF_FILE, "", line_, column_};
    }
    
    int startLine = line_;
    int startCol = column_;
    char c = advance();
    
    switch (c) {
        case '+': return {TokenType::PLUS, "+", startLine, startCol};
        case '-': return {TokenType::MINUS, "-", startLine, startCol};
        case '*': return {TokenType::STAR, "*", startLine, startCol};
        case '/': return {TokenType::SLASH, "/", startLine, startCol};
        case '(': return {TokenType::LPAREN, "(", startLine, startCol};
        case ')': return {TokenType::RPAREN, ")", startLine, startCol};
        case '{': return {TokenType::LBRACE, "{", startLine, startCol};
        case '}': return {TokenType::RBRACE, "}", startLine, startCol};
        case ';': return {TokenType::SEMICOLON, ";", startLine, startCol};
        case ',': return {TokenType::COMMA, ",", startLine, startCol};
        case '=':
            if (peek() == '=') {
                advance();
                return {TokenType::EQ, "==", startLine, startCol};
            }
            return {TokenType::ASSIGN, "=", startLine, startCol};
        case '!':
            if (peek() == '=') {
                advance();
                return {TokenType::NE, "!=", startLine, startCol};
            }
            return errorToken("Unexpected character '!'");
        case '<':
            if (peek() == '=') {
                advance();
                return {TokenType::LE, "<=", startLine, startCol};
            }
            return {TokenType::LT, "<", startLine, startCol};
        case '>':
            if (peek() == '=') {
                advance();
                return {TokenType::GE, ">=", startLine, startCol};
            }
            return {TokenType::GT, ">", startLine, startCol};
        default:
            if (std::isdigit(c)) {
                pos_--; column_--;
                return scanNumber();
            }
            if (std::isalpha(c) || c == '_') {
                pos_--; column_--;
                return scanIdentifier();
            }
            return errorToken("Unexpected character '" + std::string(1, c) + "'");
    }
}

std::vector<Token> Lexer::tokenize() {
    std::vector<Token> tokens;
    errors_.clear();
    
    while (pos_ < source_.size()) {
        Token tok = scanToken();
        tokens.push_back(tok);
        if (tok.type == TokenType::END_OF_FILE) {
            break;
        }
    }
    
    if (tokens.empty() || tokens.back().type != TokenType::END_OF_FILE) {
        tokens.push_back({TokenType::END_OF_FILE, "", line_, column_});
    }
    
    return tokens;
}

Parser::Parser(const std::vector<Token>& tokens)
    : tokens_(tokens), pos_(0), tempCounter_(0), labelCounter_(0) {}

const Token& Parser::current() const {
    static Token eof{TokenType::END_OF_FILE, "", 0, 0};
    return pos_ < tokens_.size() ? tokens_[pos_] : eof;
}

const Token& Parser::peek(int offset) const {
    size_t idx = pos_ + offset;
    static Token eof{TokenType::END_OF_FILE, "", 0, 0};
    return idx < tokens_.size() ? tokens_[idx] : eof;
}

bool Parser::isAtEnd() const {
    return current().type == TokenType::END_OF_FILE;
}

bool Parser::check(TokenType type) const {
    return current().type == type;
}

bool Parser::match(TokenType type) {
    if (check(type)) {
        pos_++;
        return true;
    }
    return false;
}

bool Parser::expect(TokenType type, const std::string& message) {
    if (match(type)) return true;
    errorAt(current(), message);
    return false;
}

void Parser::error(const std::string& message) {
    errorAt(current(), message);
}

void Parser::errorAt(const Token& token, const std::string& message) {
    errors_.push_back({message, token.line, token.column});
}

std::optional<IRProgram> Parser::parse() {
    errors_.clear();
    tempCounter_ = 0;
    labelCounter_ = 0;
    
    IRProgram ir;
    
    if (!parseProgram(ir)) {
        return std::nullopt;
    }
    
    return ir;
}

bool Parser::parseProgram(IRProgram& ir) {
    if (!expect(TokenType::INT, "Expected 'int'")) return false;
    if (!expect(TokenType::IDENTIFIER, "Expected 'main'")) return false;
    if (!expect(TokenType::LPAREN, "Expected '('")) return false;
    if (!expect(TokenType::RPAREN, "Expected ')'")) return false;
    if (!expect(TokenType::LBRACE, "Expected '{'")) return false;
    
    while (!isAtEnd() && !check(TokenType::RBRACE)) {
        if (check(TokenType::INT)) {
            if (!parseDeclaration(ir)) return false;
        } else {
            if (!parseStatement(ir)) return false;
        }
    }
    
    if (!expect(TokenType::RBRACE, "Expected '}'")) return false;
    
    ir.add(IRInstruction::Halt());
    
    return true;
}

bool Parser::parseDeclaration(IRProgram& ir) {
    if (!expect(TokenType::INT, "Expected 'int'")) return false;
    
    if (!check(TokenType::IDENTIFIER)) {
        error("Expected variable name");
        return false;
    }
    
    std::string varName = current().text;
    match(TokenType::IDENTIFIER);
    ir.addVariable(varName);
    
    if (match(TokenType::ASSIGN)) {
        auto temp = parseExpression(ir);
        if (!temp) return false;
        ir.add(IRInstruction::Store(varName, *temp));
    }
    
    if (!expect(TokenType::SEMICOLON, "Expected ';'")) return false;
    
    return true;
}

bool Parser::parseStatement(IRProgram& ir) {
    if (check(TokenType::RETURN)) {
        match(TokenType::RETURN);
        if (!check(TokenType::SEMICOLON)) {
            auto temp = parseExpression(ir);
            if (!temp) return false;
            ir.add(IRInstruction::Store("result", *temp));
        }
        if (!expect(TokenType::SEMICOLON, "Expected ';'")) return false;
        return true;
    }
    
    if (check(TokenType::IF)) {
        match(TokenType::IF);
        if (!expect(TokenType::LPAREN, "Expected '('")) return false;
        
        auto condTemp = parseExpression(ir);
        if (!condTemp) return false;
        
        if (!expect(TokenType::RPAREN, "Expected ')'")) return false;
        if (!expect(TokenType::LBRACE, "Expected '{'")) return false;
        
        std::string elseLabel = newLabel();
        std::string endLabel = newLabel();
        
        ir.add(IRInstruction::JumpIfZero(*condTemp, elseLabel));
        
        while (!isAtEnd() && !check(TokenType::RBRACE)) {
            if (check(TokenType::INT)) {
                if (!parseDeclaration(ir)) return false;
            } else {
                if (!parseStatement(ir)) return false;
            }
        }
        if (!expect(TokenType::RBRACE, "Expected '}'")) return false;
        
        if (match(TokenType::ELSE)) {
            ir.add(IRInstruction::Jump(endLabel));
            ir.add(IRInstruction::Label(elseLabel));
            
            if (!expect(TokenType::LBRACE, "Expected '{'")) return false;
            while (!isAtEnd() && !check(TokenType::RBRACE)) {
                if (check(TokenType::INT)) {
                    if (!parseDeclaration(ir)) return false;
                } else {
                    if (!parseStatement(ir)) return false;
                }
            }
            if (!expect(TokenType::RBRACE, "Expected '}'")) return false;
            
            ir.add(IRInstruction::Label(endLabel));
        } else {
            ir.add(IRInstruction::Label(elseLabel));
        }
        
        return true;
    }
    
    if (check(TokenType::WHILE)) {
        match(TokenType::WHILE);
        if (!expect(TokenType::LPAREN, "Expected '('")) return false;
        
        std::string startLabel = newLabel();
        std::string endLabel = newLabel();
        
        ir.add(IRInstruction::Label(startLabel));
        
        auto condTemp = parseExpression(ir);
        if (!condTemp) return false;
        
        if (!expect(TokenType::RPAREN, "Expected ')'")) return false;
        if (!expect(TokenType::LBRACE, "Expected '{'")) return false;
        
        ir.add(IRInstruction::JumpIfZero(*condTemp, endLabel));
        
        while (!isAtEnd() && !check(TokenType::RBRACE)) {
            if (check(TokenType::INT)) {
                if (!parseDeclaration(ir)) return false;
            } else {
                if (!parseStatement(ir)) return false;
            }
        }
        if (!expect(TokenType::RBRACE, "Expected '}'")) return false;
        
        ir.add(IRInstruction::Jump(startLabel));
        ir.add(IRInstruction::Label(endLabel));
        
        return true;
    }
    
    if (check(TokenType::IDENTIFIER) && peek().type == TokenType::ASSIGN) {
        std::string varName = current().text;
        match(TokenType::IDENTIFIER);
        match(TokenType::ASSIGN);
        
        auto temp = parseExpression(ir);
        if (!temp) return false;
        
        ir.add(IRInstruction::Store(varName, *temp));
        
        if (!expect(TokenType::SEMICOLON, "Expected ';'")) return false;
        return true;
    }
    
    auto temp = parseExpression(ir);
    if (!temp) return false;
    
    if (!expect(TokenType::SEMICOLON, "Expected ';'")) return false;
    return true;
}

std::optional<std::string> Parser::parseExpression(IRProgram& ir) {
    auto left = parseTerm(ir);
    if (!left) return std::nullopt;
    
    while (check(TokenType::PLUS) || check(TokenType::MINUS)) {
        TokenType op = current().type;
        match(op);
        
        auto right = parseTerm(ir);
        if (!right) return std::nullopt;
        
        std::string result = newTemp();
        ir.add(IRInstruction::Binary(
            op == TokenType::PLUS ? IROpCode::ADD : IROpCode::SUB,
            result, *left, *right
        ));
        left = result;
    }
    
    return left;
}

std::optional<std::string> Parser::parseTerm(IRProgram& ir) {
    auto left = parseFactor(ir);
    if (!left) return std::nullopt;
    
    while (check(TokenType::STAR) || check(TokenType::SLASH)) {
        TokenType op = current().type;
        match(op);
        
        auto right = parseFactor(ir);
        if (!right) return std::nullopt;
        
        std::string result = newTemp();
        ir.add(IRInstruction::Binary(
            op == TokenType::STAR ? IROpCode::MUL : IROpCode::DIV,
            result, *left, *right
        ));
        left = result;
    }
    
    return left;
}

std::optional<std::string> Parser::parseFactor(IRProgram& ir) {
    if (check(TokenType::NUMBER)) {
        int32_t val = std::stoi(current().text);
        match(TokenType::NUMBER);
        
        std::string temp = newTemp();
        ir.add(IRInstruction::Const(temp, val));
        return temp;
    }
    
    if (check(TokenType::IDENTIFIER)) {
        std::string varName = current().text;
        match(TokenType::IDENTIFIER);
        
        std::string temp = newTemp();
        ir.add(IRInstruction::Load(temp, varName));
        return temp;
    }
    
    if (match(TokenType::LPAREN)) {
        auto temp = parseExpression(ir);
        if (!temp) return std::nullopt;
        
        if (!expect(TokenType::RPAREN, "Expected ')'")) return std::nullopt;
        return temp;
    }
    
    error("Expected number, variable, or parenthesized expression");
    return std::nullopt;
}

} // namespace iil
