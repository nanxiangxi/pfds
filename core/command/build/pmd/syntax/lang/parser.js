// pmd/syntax/lang/parser.js
// PMD 多语言语法语法分析器

const { LangLexer, TokenType } = require('./lexer');

class LangParser {
    constructor(input) {
        this.lexer = new LangLexer(input);
        this.tokens = [];
        this.currentTokenIndex = 0;
    }
    
    /**
     * 解析多语言语法
     * @returns {Object} 解析结果，包含语言键值对
     */
    parse() {
        // 执行词法分析
        this.tokens = this.lexer.tokenize();
        this.currentTokenIndex = 0;
        
        // 开始语法分析
        return this.parseLangStatement();
    }
    
    /**
     * 解析多语言语句
     * @returns {Object} 解析结果
     */
    parseLangStatement() {
        // 消费lang关键字
        this.consume(TokenType.LANG_KEYWORD);
        
        // 消费左方括号
        this.consume(TokenType.LEFT_BRACKET);
        
        // 解析语言键值对列表
        const langPairs = this.parseLangPairs();
        
        // 消费右方括号
        this.consume(TokenType.RIGHT_BRACKET);
        
        // 检查是否到达文件末尾
        this.consume(TokenType.EOF);
        
        return {
            type: 'lang',
            langPairs: langPairs
        };
    }
    
    /**
     * 解析语言键值对列表
     * @returns {Object} 语言键值对对象
     */
    parseLangPairs() {
        const langPairs = {};
        
        // 解析第一个键值对
        if (this.currentToken().type === TokenType.IDENTIFIER) {
            const pair = this.parseLangPair();
            langPairs[pair.key] = pair.value;
            
            // 解析后续的键值对（如果有的话）
            while (this.currentToken().type !== TokenType.RIGHT_BRACKET) {
                // 如果遇到EOF但在右方括号之前，说明语法错误
                if (this.currentToken().type === TokenType.EOF) {
                    throw new Error('Unexpected end of input, expected "]"');
                }
                
                // 解析下一个键值对
                const nextPair = this.parseLangPair();
                langPairs[nextPair.key] = nextPair.value;
            }
        }
        
        return langPairs;
    }
    
    /**
     * 解析单个语言键值对
     * @returns {Object} 包含key和value的对象
     */
    parseLangPair() {
        // 解析标识符（语言代码）
        const keyToken = this.consume(TokenType.IDENTIFIER);
        const key = keyToken.value;
        
        // 解析等号
        this.consume(TokenType.EQUALS);
        
        // 解析字符串值
        const valueToken = this.consume(TokenType.STRING);
        const value = valueToken.value;
        
        return {
            key: key,
            value: value
        };
    }
    
    /**
     * 获取当前词法单元
     * @returns {Token} 当前词法单元
     */
    currentToken() {
        if (this.currentTokenIndex < this.tokens.length) {
            return this.tokens[this.currentTokenIndex];
        }
        return null;
    }
    
    /**
     * 消费指定类型的词法单元
     * @param {string} expectedType - 期望的词法单元类型
     * @returns {Token} 消费的词法单元
     */
    consume(expectedType) {
        const token = this.currentToken();
        if (!token) {
            throw new Error(`Unexpected end of input, expected ${expectedType}`);
        }
        
        if (token.type !== expectedType) {
            throw new Error(`Unexpected token "${token.value}" of type ${token.type}, expected ${expectedType} at position ${token.position}`);
        }
        
        this.currentTokenIndex++;
        return token;
    }
}

module.exports = LangParser;