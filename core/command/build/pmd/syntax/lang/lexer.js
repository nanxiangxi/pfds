// pmd/syntax/lang/lexer.js
// PMD 多语言语法词法分析器

// 词法单元类型
const TokenType = {
    LANG_KEYWORD: 'LANG_KEYWORD',     // lang关键字
    LEFT_BRACKET: 'LEFT_BRACKET',     // [
    RIGHT_BRACKET: 'RIGHT_BRACKET',   // ]
    IDENTIFIER: 'IDENTIFIER',         // 标识符（语言代码）
    EQUALS: 'EQUALS',                 // =
    STRING: 'STRING',                 // 字符串值
    EOF: 'EOF'                        // 文件结束
};

class Token {
    constructor(type, value, position = 0) {
        this.type = type;
        this.value = value;
        this.position = position;
    }
}

class LangLexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.tokens = [];
    }
    
    /**
     * 执行词法分析
     * @returns {Token[]} 词法单元数组
     */
    tokenize() {
        this.tokens = [];
        this.position = 0;
        
        // 跳过开头的空白字符
        this.skipWhitespace();
        
        // 检查是否以lang关键字开始
        if (this.match('lang')) {
            this.tokens.push(new Token(TokenType.LANG_KEYWORD, 'lang', this.position - 4));
        } else {
            throw new Error('Expected "lang" keyword at start of multilingual syntax');
        }
        
        // 处理左方括号
        this.skipWhitespace();
        if (this.match('[')) {
            this.tokens.push(new Token(TokenType.LEFT_BRACKET, '[', this.position - 1));
        } else {
            throw new Error('Expected "[" after "lang" keyword');
        }
        
        // 处理键值对
        while (this.position < this.input.length && this.currentChar() !== ']') {
            this.skipWhitespace();
            
            // 检查是否是右方括号，表示结束
            if (this.currentChar() === ']') {
                break;
            }
            
            // 解析标识符（语言代码）
            const identifier = this.parseIdentifier();
            if (!identifier) {
                throw new Error(`Expected language identifier at position ${this.position}`);
            }
            this.tokens.push(new Token(TokenType.IDENTIFIER, identifier, this.position));
            
            this.skipWhitespace();
            
            // 解析等号
            if (this.match('=')) {
                this.tokens.push(new Token(TokenType.EQUALS, '=', this.position - 1));
            } else {
                throw new Error(`Expected "=" after identifier "${identifier}"`);
            }
            
            this.skipWhitespace();
            
            // 解析字符串值
            const stringValue = this.parseString();
            if (stringValue === null) {
                throw new Error(`Expected string value after "=" for identifier "${identifier}"`);
            }
            this.tokens.push(new Token(TokenType.STRING, stringValue, this.position));
            
            this.skipWhitespace();
            
            // 如果遇到逗号，跳过它并继续解析下一个键值对
            if (this.currentChar() === ',') {
                this.position++;
                this.skipWhitespace();
            }
        }
        
        // 处理右方括号
        if (this.match(']')) {
            this.tokens.push(new Token(TokenType.RIGHT_BRACKET, ']', this.position - 1));
        } else {
            throw new Error('Expected "]" to close multilingual syntax');
        }
        
        // 添加文件结束标记
        this.tokens.push(new Token(TokenType.EOF, null, this.position));
        
        return this.tokens;
    }
    
    /**
     * 跳过空白字符
     */
    skipWhitespace() {
        while (this.position < this.input.length && /\s/.test(this.currentChar())) {
            this.position++;
        }
    }
    
    /**
     * 检查并匹配指定字符串
     * @param {string} str - 要匹配的字符串
     * @returns {boolean} 是否匹配成功
     */
    match(str) {
        if (this.position + str.length <= this.input.length) {
            const substr = this.input.substring(this.position, this.position + str.length);
            if (substr === str) {
                this.position += str.length;
                return true;
            }
        }
        return false;
    }
    
    /**
     * 获取当前字符
     * @returns {string|null} 当前字符或null（如果已到末尾）
     */
    currentChar() {
        if (this.position < this.input.length) {
            return this.input[this.position];
        }
        return null;
    }
    
    /**
     * 解析标识符
     * @returns {string|null} 标识符或null（如果解析失败）
     */
    parseIdentifier() {
        let start = this.position;
        // 标识符可以包含字母、数字、下划线和中文字符
        while (this.position < this.input.length && 
               (/[\w\u4e00-\u9fa5]/.test(this.currentChar()))) {
            this.position++;
        }
        
        if (this.position > start) {
            return this.input.substring(start, this.position);
        }
        return null;
    }
    
    /**
     * 解析字符串值
     * @returns {string|null} 字符串值或null（如果解析失败）
     */
    parseString() {
        if (this.currentChar() !== '"') {
            return null;
        }
        
        this.position++; // 跳过开始引号
        let value = '';
        
        // 处理字符串内容，支持转义字符
        while (this.position < this.input.length && this.currentChar() !== '"') {
            if (this.currentChar() === '\\') {
                // 处理转义字符
                this.position++;
                if (this.position < this.input.length) {
                    const escapedChar = this.currentChar();
                    switch (escapedChar) {
                        case 'n':
                            value += '\n';
                            break;
                        case 't':
                            value += '\t';
                            break;
                        case 'r':
                            value += '\r';
                            break;
                        case '"':
                            value += '"';
                            break;
                        case '\\':
                            value += '\\';
                            break;
                        default:
                            value += '\\' + escapedChar;
                    }
                    this.position++;
                }
            } else {
                value += this.currentChar();
                this.position++;
            }
        }
        
        if (this.currentChar() !== '"') {
            throw new Error('Unterminated string literal');
        }
        
        this.position++; // 跳过结束引号
        return value;
    }
}

module.exports = {
    LangLexer,
    TokenType,
    Token
};