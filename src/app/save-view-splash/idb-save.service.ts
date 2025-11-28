import * as pako from 'pako';

export interface LastSaveData {
    rawData: any;
    fileType: string;
}

interface CompressedSaveData {
    compressed: Uint8Array;
    fileType: string;
}

export class IdbSaveService {
    private dbName = 'SaveViewSplashDB';
    private storeName = 'lastSave';

    private getDb(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveLastSave(data: LastSaveData): Promise<void> {
        const jsonStr = JSON.stringify(data.rawData);
        const originalSize = jsonStr.length;
        const compressed = pako.deflate(jsonStr);
        const compressedSize = compressed.length;
        console.log(`[IdbSaveService] Save size before compression: ${originalSize} bytes`);
        console.log(`[IdbSaveService] Save size after compression: ${compressedSize} bytes`);
        const toStore: CompressedSaveData = {
            compressed,
            fileType: data.fileType
        };
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            store.put(toStore, 'last');
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async loadLastSave(): Promise<LastSaveData | undefined> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const req = store.get('last');
            req.onsuccess = () => {
                const result = req.result as CompressedSaveData | undefined;
                if (!result) return resolve(undefined);
                try {
                    const decompressed = pako.inflate(result.compressed, { to: 'string' });
                    const rawData = JSON.parse(decompressed);
                    resolve({ rawData, fileType: result.fileType });
                } catch (e) {
                    reject(e);
                }
            };
            req.onerror = () => reject(req.error);
        });
    }

    async clearLastSave(): Promise<void> {
        const db = await this.getDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            store.delete('last');
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
}
