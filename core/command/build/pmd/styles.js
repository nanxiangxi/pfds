// pmd/styles.js
// PMD 默认样式

const defaultStyles = `
/* 基础分割线样式 */
.pmd-thematic-break {
  border: none;
  height: 1px;
  background-color: #ddd;
  margin: 1.5em 0;
}

/* 双分割线样式 */
.pmd-thematic-break.pmd-thematic-break-double {
  height: 3px;
  background: linear-gradient(to bottom, #ddd, #ddd 1px, transparent 1px, transparent 2px, #ddd 2px, #ddd 3px);
}

/* 星号分割线样式 */
.pmd-thematic-break.pmd-thematic-break-star {
  height: auto;
  background: none;
  position: relative;
  text-align: center;
  border: none;
  margin: 1.5em 0;
}

.pmd-thematic-break.pmd-thematic-break-star:before {
  content: "⁂";
  display: inline-block;
  font-size: 1.2em;
  color: #999;
  background-color: #fff;
  padding: 0 10px;
  position: relative;
  z-index: 1;
}

.pmd-thematic-break.pmd-thematic-break-star:after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #ddd;
  z-index: 0;
}

/* ^号分割线样式 */
.pmd-thematic-break.pmd-thematic-break-caret {
  height: auto;
  background: none;
  position: relative;
  text-align: center;
  border: none;
  margin: 1.5em 0;
}

.pmd-thematic-break.pmd-thematic-break-caret:before {
  content: "⁀⁀⁀";
  display: inline-block;
  font-size: 1.2em;
  color: #999;
  background-color: #fff;
  padding: 0 10px;
  position: relative;
  z-index: 1;
}

.pmd-thematic-break.pmd-thematic-break-caret:after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #ddd;
  z-index: 0;
}

/* 虚线分割线样式 */
.pmd-thematic-break.pmd-thematic-break-dotted {
  border: none;
  height: 1px;
  background: radial-gradient(circle, #ddd 30%, transparent 30%) 0 0;
  background-size: 10px 1px;
  margin: 1.5em 0;
}

/* 其他样式保持不变 */
`;

module.exports = defaultStyles;