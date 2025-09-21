// pmd/lexer.js
// PMD 词法分析器

class PMDLexer {
    constructor() {
        // 定义词法标记类型
        this.TOKEN_TYPES = {
            HEADING: 'HEADING',              // 标题 (# ## ###)
            TEXT: 'TEXT',                    // 普通文本
            WHITESPACE: 'WHITESPACE',        // 空白字符
            NEWLINE: 'NEWLINE',              // 换行符
            THEMATIC_BREAK: 'THEMATIC_BREAK', // 分割线 (---)
            NOTIFICATION_START: 'NOTIFICATION_START', // 提示框开始 (:::
            NOTIFICATION_END: 'NOTIFICATION_END',     // 提示框结束 :::
            ROUNDED_NOTIFICATION_START: 'ROUNDED_NOTIFICATION_START', // 圆角提示框开始 (::
            ROUNDED_NOTIFICATION_END: 'ROUNDED_NOTIFICATION_END',     // 圆角提示框结束 ::)
            EOF: 'EOF'                       // 文件结束
        };
    }

    /**
     * 对输入文本进行词法分析
     * @param {string} input - PMD源代码
     * @returns {Array} 词法标记数组
     */
    tokenize(input) {
        const tokens = [];
        let position = 0;
        const length = input.length;

        while (position < length) {
            let char = input[position];
            
            // 处理换行符
            if (char === '\n') {
                tokens.push({
                    type: this.TOKEN_TYPES.NEWLINE,
                    value: char,
                    position: position
                });
                position++;
                continue;
            }
            
            // 处理回车符
            if (char === '\r') {
                // 处理 CRLF
                if (position + 1 < length && input[position + 1] === '\n') {
                    tokens.push({
                        type: this.TOKEN_TYPES.NEWLINE,
                        value: '\r\n',
                        position: position
                    });
                    position += 2;
                } else {
                    tokens.push({
                        type: this.TOKEN_TYPES.NEWLINE,
                        value: char,
                        position: position
                    });
                    position++;
                }
                continue;
            }
            
            // 处理分割线 (---)
            if (char === '-' && 
                position + 2 < length && 
                input[position + 1] === '-' && 
                input[position + 2] === '-') {
                // 检查分割线前后是否是独立的行
                let isThematicBreak = true;
                let pos = position + 3;
                
                // 检查后面是否只有空格直到行尾
                while (pos < length && input[pos] !== '\n' && input[pos] !== '\r') {
                    if (input[pos] !== ' ' && input[pos] !== '\t') {
                        isThematicBreak = false;
                        break;
                    }
                    pos++;
                }
                
                // 检查前面是否是行首或者只有空格
                let prevPos = position - 1;
                let isStartOfLine = true;
                while (prevPos >= 0 && input[prevPos] !== '\n' && input[prevPos] !== '\r') {
                    if (input[prevPos] !== ' ' && input[prevPos] !== '\t') {
                        isStartOfLine = false;
                        break;
                    }
                    prevPos--;
                }
                
                if (isThematicBreak && isStartOfLine) {
                    tokens.push({
                        type: this.TOKEN_TYPES.THEMATIC_BREAK,
                        value: '---',
                        position: position
                    });
                    position += 3;
                    // 跳过后面的空格直到行尾
                    while (position < length && 
                           input[position] !== '\n' && 
                           input[position] !== '\r') {
                        position++;
                    }
                    continue;
                }
            }
            
            // 处理圆角提示框开始 (::
            if (char === '(' && 
                position + 1 < length && 
                input[position + 1] === ':' && 
                input[position + 2] === ':') {
                tokens.push({
                    type: this.TOKEN_TYPES.ROUNDED_NOTIFICATION_START,
                    value: '(::',
                    position: position
                });
                position += 3;
                continue;
            }
            
            // 处理圆角提示框结束 ::)
            if (char === ':' && 
                position + 1 < length && 
                input[position + 1] === ':' && 
                input[position + 2] === ')') {
                tokens.push({
                    type: this.TOKEN_TYPES.ROUNDED_NOTIFICATION_END,
                    value: '::)',
                    position: position
                });
                position += 3;
                continue;
            }
            
            // 处理普通提示框开始 (:::
            if (char === ':' && 
                position + 2 < length && 
                input[position + 1] === ':' && 
                input[position + 2] === ':') {
                tokens.push({
                    type: this.TOKEN_TYPES.NOTIFICATION_START,
                    value: ':::',
                    position: position
                });
                position += 3;
                continue;
            }
            
            // 处理普通提示框结束 :::
            if (char === ':' && 
                position + 2 < length && 
                input[position + 1] === ':' && 
                input[position + 2] === ':') {
                // 需要检查是否是结束标记
                let isEnd = true;
                let pos = position + 3;
                
                // 检查后面是否是行尾或只有空格直到行尾
                while (pos < length && input[pos] !== '\n' && input[pos] !== '\r') {
                    if (input[pos] !== ' ' && input[pos] !== '\t') {
                        isEnd = false;
                        break;
                    }
                    pos++;
                }
                
                // 检查前面是否是独立的标记
                let prevPos = position - 1;
                let isIsolated = true;
                if (prevPos >= 0 && input[prevPos] !== ' ' && input[prevPos] !== '\t' && input[prevPos] !== '\n' && input[prevPos] !== '\r') {
                    isIsolated = false;
                }
                
                if (isEnd && isIsolated) {
                    tokens.push({
                        type: this.TOKEN_TYPES.NOTIFICATION_END,
                        value: ':::',
                        position: position
                    });
                    position += 3;
                    // 跳过后面的空格直到行尾
                    while (position < length && 
                           input[position] !== '\n' && 
                           input[position] !== '\r') {
                        position++;
                    }
                    continue;
                }
            }
            
            // 处理标题 (# ## ###)
            if (char === '#') {
                let hashes = '';
                let pos = position;
                
                // 计算连续的 # 符号
                while (pos < length && input[pos] === '#') {
                    hashes += input[pos];
                    pos++;
                }
                
                // 检查是否是有效的标题标记（后面必须跟空格）
                if (pos < length && input[pos] === ' ') {
                    tokens.push({
                        type: this.TOKEN_TYPES.HEADING,
                        value: hashes,
                        level: hashes.length,
                        position: position
                    });
                    position = pos;
                    continue;
                }
            }
            
            // 处理空白字符（空格、制表符等）
            if (/\s/.test(char)) {
                let whitespace = '';
                let pos = position;
                
                while (pos < length && /\s/.test(input[pos]) && input[pos] !== '\n' && input[pos] !== '\r') {
                    whitespace += input[pos];
                    pos++;
                }
                
                tokens.push({
                    type: this.TOKEN_TYPES.WHITESPACE,
                    value: whitespace,
                    position: position
                });
                position = pos;
                continue;
            }
            
            
            // 处理普通文本
            let text = '';
            let pos = position;
            
            while (pos < length && 
                   input[pos] !== '\n' && 
                   input[pos] !== '\r' && 
                   input[pos] !== '#') {
                // 检查是否是标题开始
                if (input[pos] === '#' && pos > position) {
                    // 检查前面是否是空格
                    if (input[pos - 1] === ' ') {
                        break;
                    }
                }
                text += input[pos];
                pos++;
            }
            
            if (text) {
                tokens.push({
                    type: this.TOKEN_TYPES.TEXT,
                    value: text,
                    position: position
                });
                position = pos;
                continue;
            }
            
            // 处理其他字符
            tokens.push({
                type: this.TOKEN_TYPES.TEXT,
                value: char,
                position: position
            });
            position++;
        }
        
        // 添加文件结束标记
        tokens.push({
            type: this.TOKEN_TYPES.EOF,
            value: '',
            position: position
        });
        
        return tokens;
    }
}

module.exports = PMDLexer;