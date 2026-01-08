function createBackend(path: string[] = []) {
    return new Proxy(() => { }, {
        get(_, prop: string) {
            const newPath = [...path, prop];
            return createBackend(newPath);
        },
        apply(_, __, args) {
            return fetch('/functions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ funcs: path, args })
            }).then(res => {
                if (!res.ok) {
                    throw new Error(`http error! status: ${res.status}`);
                }
                return res.json();
            }).then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                return data.result;
            });
        }
    });
}

const backend = createBackend(['backend']);
export default backend;