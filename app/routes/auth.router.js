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
            '/signPhone',
            this._AuthController.signPhone,
        );

        router.post(
            '/signCode',
            this._AuthController.signCode,
        );

        router.post(
          '/refreshToken',
          this._AuthController.refreshToken,
        );

        return router;
    }
}

module.exports = authRouterProvider;
