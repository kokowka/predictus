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
        router.post(
            '/getUserInfo',
            this._UserController.getUserInfo,
        );
        router.post(
            '/addContacts',
            this._UserController.addContacts,
        );
        router.post(
            '/addSms',
            this._UserController.addSms,
        );
        router.post(
            '/addInstalledApplications',
            this._UserController.addInstalledApplications,
        );
        router.post(
            '/updateLocation',
            this._UserController.updateLocation,
        );

        return router;
    }
}

module.exports = userRouterProvider;
