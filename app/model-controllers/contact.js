const Logger = require('../framework-nodejs/core/Logger/Logger');

function contactModelControllerProvider(Contact, config) {
    return new ContactModelController(Contact, config);
}
contactModelControllerProvider.$inject = ['Contact', 'config'];

class ContactModelController {
    constructor(Contact, config) {
        this._Contact = Contact;
        this._log = new Logger('Contact Model-Controller', config.logger);
    }

    async create(data = {}) {

        const contact = await this._Contact.create(data);
        this._log.info(`Contact with id <${contact.get('id')}> was created`);

        return contact;
    }

    async find(data = {}) {
        return await this._Contact.findOne({
            where: data,
        });
    }
}

module.exports = contactModelControllerProvider;
