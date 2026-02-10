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