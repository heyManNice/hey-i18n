export function mergeTextAndVariables(texts: string[], variables: string[]): string {
    let result = '';
    for (let i = 0; i < texts.length; i++) {
        result += texts[i];
        if (i < variables.length) {
            result += `{${variables[i]}}`;
        }
    }
    return result;
}

export function splitTextWithVariables(text: string): { type: 'text' | 'variable', content: string }[] {
    const parts = text.split(/({[^}]+})/g).filter(p => p);
    return parts.map(part => {
        if (part.startsWith('{') && part.endsWith('}')) {
            return { type: 'variable', content: part };
        }
        return { type: 'text', content: part };
    });
}
