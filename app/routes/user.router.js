const express = require('express');

function userRouterProvider(UserController) {
    return new UserRouter(UserController);
}
userRouterProvider.$inject = ['UserController'];

class UserRouter {
    constructor(UserController) {
        this._UserController = UserController;
    }

    initRouter() {
        const router = express.Router();

        router.post(
            '/setUserInfo',
            this._UserController.setUserInfo,
        );
        return router;
    }
}

module.exports = userRouterProvider;
