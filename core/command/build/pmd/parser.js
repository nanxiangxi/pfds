// pmd/parser.js
// PMD (Plain Markdown) 解析器
// 使用模块化语法系统实现

const { loadSyntaxModules } = require('./syntax');
const crypto = require('crypto');

class PMDParser {
    constructor() {
        // 加载所有语法模块并按优先级排序（从高到低）
        this.syntaxModules = loadSyntaxModules();
        this.syntaxModules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        // 获取多语言语法模块用于文本处理
        this.langModule = this.syntaxModules.find(module => module.name === 'lang');
        // 获取纯文本语法模块
        this.rawTextModule = this.syntaxModules.find(module => module.name === 'rawText');
        
        // 存储纯文本占位符的映射
        this.rawTextPlaceholders = new Map();
    }
    
    /**
     * 生成唯一的占位符ID
     * @returns {string} 唯一的占位符ID
     */
    generatePlaceholderId() {
        return 'RAW_TEXT_PLACEHOLDER_' + crypto.randomBytes(16).toString('hex');
    }
    
    /**
     * 提取并替换纯文本内容
     * @param {string} content - 原始内容
     * @returns {string} 替换占位符后的内容
     */
    extractRawText(content) {
        if (!this.rawTextModule) {
            return content;
        }
        
        const lines = content.split('\n');
        let result = '';
        let i = 0;
        
        while (i < lines.length) {
            const line = lines[i];
            let processed = false;
            
            // 检查是否匹配纯文本语法
            if (this.rawTextModule.matches(line)) {
                // 尝试解析纯文本语法
                const parseResult = this.rawTextModule.parse(lines, i);
                if (parseResult && parseResult.html) {
                    // 生成占位符
                    const placeholderId = this.generatePlaceholderId();
                    
                    // 存储原始HTML内容
                    this.rawTextPlaceholders.set(placeholderId, parseResult.html);
                    
                    // 添加占位符到结果中
                    result += placeholderId + '\n';
                    
                    // 跳过已处理的行
                    i = parseResult.endIndex + 1;
                    processed = true;
                }
            }
            
            if (!processed) {
                result += line + '\n';
                i++;
            }
        }
        
        // 移除最后多余的换行符
        return result.trimEnd();
    }
    
    /**
     * 恢复纯文本内容
     * @param {string} content - 包含占位符的内容
     * @returns {string} 恢复后的完整内容
     */
    restoreRawText(content) {
        let result = content;
        
        // 替换所有占位符为原始内容
        for (const [placeholderId, rawTextHtml] of this.rawTextPlaceholders.entries()) {
            result = result.replace(new RegExp(placeholderId, 'g'), rawTextHtml);
        }
        
        return result;
    }

    /**
     * 处理文本行中的多语言语法
     * @param {string} line - 文本行
     * @returns {string} 处理后的文本行
     */
    processTextLine(line) {
        if (!this.langModule) {
            return line;
        }
        
        // 查找并替换所有多语言语法
        let result = line;
        // 修复正则表达式，使其能正确匹配嵌入在文本中的多语言语法
        const langRegex = /lang\[[^\]]*\]/g;
        let match;
        
        // 使用循环查找所有匹配项
        const matches = [];
        while ((match = langRegex.exec(line)) !== null) {
            matches.push({
                syntax: match[0],
                index: match.index
            });
        }
        
        // 从后往前替换，避免索引变化影响替换
        for (let i = matches.length - 1; i >= 0; i--) {
            const { syntax } = matches[i];
            const parsed = this.langModule.parse(syntax);
            if (parsed && parsed.html) {
                result = result.replace(syntax, parsed.html);
            }
        }
        
        return result;
    }

    /**
     * 解析PMD块内容
     * @param {string} content - PMD源代码
     * @returns {string} HTML字符串
     */
    parse(content) {
        if (!content) return '';
        
        // 首先提取并替换所有纯文本内容
        const contentWithPlaceholders = this.extractRawText(content);
        
        const lines = contentWithPlaceholders.split('\n');
        const parsedElements = [];
        let i = 0;
        
        // 解析每一行或块
        while (i < lines.length) {
            const line = lines[i];
            let parsed = false;
            let linesConsumed = 1; // 默认消耗1行
            let parsedResult = null;
            
            // 检查是否是纯文本占位符
            if (this.rawTextPlaceholders.has(line.trim())) {
                parsedResult = line.trim();
                parsed = true;
            } else {
                // 尝试所有语法模块
                for (const syntax of this.syntaxModules) {
                    // 跳过纯文本模块，因为我们已经预先处理过了
                    if (syntax.name === 'rawText') {
                        continue;
                    }
                    
                    if (syntax.matches && syntax.matches(line)) {
                        // 检查是否有多行解析方法
                        if (syntax.parseMultiLine && typeof syntax.parseMultiLine === 'function') {
                            // 多行语法（如多行多语言语法）
                            const result = syntax.parseMultiLine(lines, i);
                            if (result && result.html) {
                                parsedResult = result.html;
                                if (result.endIndex !== undefined) {
                                    linesConsumed = result.endIndex - i + 1;
                                }
                                parsed = true;
                                break;
                            }
                        } else if (syntax.parse.length > 1) {
                            // 多行语法（如多行通知框）
                            const result = syntax.parse(lines, i);
                            if (result && result.html) {
                                parsedResult = result.html;
                                if (result.endIndex !== undefined) {
                                    linesConsumed = result.endIndex - i + 1;
                                }
                                parsed = true;
                                break;
                            }
                        } else {
                            // 单行语法（如标题、分割线等）
                            const result = syntax.parse(line);
                            if (result && result.html) {
                                parsedResult = result.html;
                                parsed = true;
                                break;
                            }
                        }
                    }
                }
            }
            
            // 保存解析结果
            if (parsed) {
                parsedElements.push({
                    type: 'parsed',
                    content: parsedResult
                });
            } else {
                // 普通内容
                if (line.trim() !== '') {
                    // 处理普通文本中的多语言语法
                    const processedLine = this.processTextLine(line);
                    parsedElements.push({
                        type: 'text',
                        content: processedLine
                    });
                } else {
                    // 空行需要保留
                    parsedElements.push({
                        type: 'empty',
                        content: '\n'
                    });
                }
            }
            
            i += linesConsumed;
        }
        
        // 构建输出内容
        let output = '';
        for (let j = 0; j < parsedElements.length; j++) {
            output += parsedElements[j].content;
            
            // 只有当下一个元素是空行时才添加换行
            if (j < parsedElements.length - 1 && parsedElements[j + 1].type === 'empty') {
                output += '\n';
            }
        }
        
        // 恢复纯文本内容
        const finalOutput = this.restoreRawText(output);
        
        // 使用外层容器包裹所有内容，添加line-height以确保一致性
        return `<div style="white-space: pre-wrap; line-height: normal; margin: 0; padding: 0;">${finalOutput}</div>`;
    }
}

/**
 * 处理 PMD 标记语言
 * @param {string} content - 原始 HTML 内容
 * @returns {string} 处理后的 HTML 内容
 */
function parsePMD(content) {
    if (!content) return '';
    
    // 匹配 >pmd ... pmd< 块
    const parser = new PMDParser();
    return content.replace(/>pmd([\s\S]*?)pmd</g, (match, pmdContent) => {
        return parser.parse(pmdContent.trim());
    });
}

module.exports = parsePMD;