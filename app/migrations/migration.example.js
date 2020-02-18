'use strict';

module.exports = {
    version: -1,

    up: (migration_task_manager) => {
        migration_task_manager.addTask('ALTER TABLE "User" ADD "some_column" INTEGER;');
        return migration_task_manager;
    },

    down: (migration_task_manager) => {
        migration_task_manager.addTask('ALTER TABLE "User" DROP COLUMN "some_column" CASCADE;');
        return migration_task_manager;
    },
};
