// 将两个数组交替合并
export function mergeTextAndVariables(texts: string[], variables: string[]) {
    const parts: { type: 'text' | 'variable'; content: string }[] = [];
    const maxLength = Math.max(texts.length, variables.length);
    for (let i = 0; i < maxLength; i++) {
        if (i < texts.length && texts[i]) {
            parts.push({ type: 'text', content: texts[i] });
        }
        if (i < variables.length && variables[i]) {
            parts.push({ type: 'variable', content: variables[i] });
        }
    }
    return parts;
}

// 把 {name} 形式的模板文本编码为 texts + varIndexes
// （varIndexes 指向源码变量的插值顺序下标，与运行时 MessageValue 一致）
export function templateToBranch(template: string, sourceVariables: string[]) {
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
            throw new Error(`源码中不存在变量 {${variableName}}`);
        }
        varIndexes.push(variableIndex);
        lastIndex = match.index + match[0].length;
    }
    texts.push(template.slice(lastIndex));
    return { texts, varIndexes };
}

// 把 texts + varIndexes 还原为 {name} 形式的模板文本（用于编辑展示）
export function branchToTemplate(texts: string[], varIndexes: number[], sourceVariables: string[]) {
    let result = '';
    for (let i = 0; i < texts.length; i++) {
        result += texts[i];
        if (i < varIndexes.length) {
            result += `{${sourceVariables[varIndexes[i]] ?? '?'}}`;
        }
    }
    return result;
}
