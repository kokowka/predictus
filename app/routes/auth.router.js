const express = require('express');

function authRouterProvider(AuthController) {
    return new AuthRouter(AuthController);
}
authRouterProvider.$inject = ['AuthController'];

class AuthRouter {
    constructor(AuthController) {
        this._AuthController = AuthController;
    }

    initRouter() {
        const router = express.Router();

        router.post(
            '/sendSms',
            this._AuthController.sendSms,
        );

        return router;
    }
}

module.exports = authRouterProvider;
