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

export function splitTextWithPlaceholders(text: string): { type: 'text' | 'placeholder', content: string }[] {
    const parts = text.split(/({[^}]+})/g).filter(p => p);
    return parts.map(part => {
        if (part.startsWith('{') && part.endsWith('}')) {
            return { type: 'placeholder', content: part };
        }
        return { type: 'text', content: part };
    });
}
