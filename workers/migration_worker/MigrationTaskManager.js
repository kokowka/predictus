class MigrationTaskManager {
    constructor() {
        this._tasks = [];

    }

    addTask(query) {
        this._tasks.push({ query });
    }

    addDestructiveTask(query) {
        this._tasks.push({ query, destructive: true });
    }

    getTasks() {
        return this._tasks;
    }
}

module.exports = MigrationTaskManager;
