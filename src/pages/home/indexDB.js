class IndexDB {
    constructor(name, version) {
        this.name = name;
        this.version = version;
        this.db = null;
    }

    open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, this.version);
            request.onerror = (event) => {
                reject(event);
            };
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(event);
            };
            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                resolve(event);
            };
        });
    }

    add(obj) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction([this.name], 'readwrite').objectStore(this.name).add(obj);
            request.onsuccess = (event) => {
                resolve(event);
            };
            request.onerror = (event) => {
                reject(event);
            };
        });
    }
}

export default IndexDB;