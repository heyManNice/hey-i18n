class Database {
    private db: IDBDatabase | null = null;
    private ready: Promise<IDBDatabase>;

    constructor() {
        this.ready = new Promise((resolve, reject) => {
            const request = indexedDB.open("hey-i18n-studio-db", 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('mTabs')) {
                    db.createObjectStore('mTabs', { keyPath: 'projectPath' });
                }
            };
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            request.onerror = () => reject(request.error);
        });
    }
    private getStore(storeName: string, mode: IDBTransactionMode = 'readonly') {
        return new Promise<IDBObjectStore>((resolve, reject) => {
            this.ready.then(() => {
                if (!this.db) {
                    return reject(new Error('Database not initialized'));
                }
                const tx = this.db.transaction(storeName, mode);
                const store = tx.objectStore(storeName);
                resolve(store);
            }).catch(err => reject(err));
        });
    }
    put(storeName: string, value: any) {
        return new Promise<IDBValidKey>((resolve, reject) => {
            this.getStore(storeName, 'readwrite')
                .then(store => {
                    const request = store.put(value);
                    request.onsuccess = () => {
                        resolve(request.result);
                    };
                    request.onerror = () => {
                        reject(request.error);
                    };
                })
                .catch(err => reject(err));
        });
    }
    get(storeName: string, key: IDBValidKey) {
        return new Promise<any>((resolve, reject) => {
            this.getStore(storeName, 'readonly')
                .then(store => {
                    const request = store.get(key);
                    request.onsuccess = () => {
                        resolve(request.result);
                    };
                    request.onerror = () => {
                        reject(request.error);
                    }
                })
                .catch(err => reject(err));
        });
    }
    filter(storeName: string, filterFn: (value: any) => boolean) {
        return new Promise<any[]>((resolve, reject) => {
            this.getStore(storeName, 'readonly')
                .then(store => {
                    const request = store.openCursor();
                    const results: any[] = [];
                    request.onsuccess = () => {
                        const cursor = request.result;
                        if (cursor) {
                            if (filterFn(cursor.value)) {
                                results.push(cursor.value);
                            }
                            cursor.continue();
                        } else {
                            resolve(results);
                        }
                    };
                    request.onerror = () => {
                        reject(request.error);
                    };
                })
                .catch(err => reject(err));
        });
    }
    delete(storeName: string, key: IDBValidKey) {
        return new Promise<void>((resolve, reject) => {
            this.getStore(storeName, 'readwrite')
                .then(store => {
                    const request = store.delete(key);
                    request.onsuccess = () => {
                        resolve();
                    }
                    request.onerror = () => {
                        reject(request.error);
                    };
                })
                .catch(err => reject(err));
        });
    }
}

export default new Database();