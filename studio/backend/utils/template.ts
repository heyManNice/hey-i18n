// 与编辑器/运行时一致的 {变量} 模板编码工具

// 把源码文本片段 + 变量名还原为 {name} 形式的模板文本（用于发给大模型）
export function buildSourceTemplate(texts: string[], variables: string[]) {
    let result = texts[0] || '';
    for (let i = 0; i < variables.length; i++) {
        result += `{${variables[i]}}`;
        result += texts[i + 1] || '';
    }
    return result;
}

// 把大模型返回的 {name} 模板编码为 texts + varIndexes
export function encodeTemplate(template: string, sourceVariables: string[]) {
    const texts: string[] = [];
    const varIndexes: number[] = [];
    const varPattern = /\{([^}]+)\}/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = varPattern.exec(template))) {
        texts.push(template.slice(lastIndex, match.index));
        const variableName = match[1].trim();
        const variableIndex = sourceVariables.indexOf(variableName);
        if (variableIndex === -1) {
            throw new Error(`AI 返回了源码中不存在的变量 {${variableName}}`);
        }
        varIndexes.push(variableIndex);
        lastIndex = match.index + match[0].length;
    }
    texts.push(template.slice(lastIndex));
    return { texts, varIndexes };
}
