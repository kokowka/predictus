// WARNING!!!!! This module should not be imported directly
const { Rule, RuleContainer } = require('../Validator/index');
const Logger = require('../Logger/Logger');

class Mailer {
    constructor(nodemailer, mailer_opts) {
        new RuleContainer()
            .withRequired('host', Rule.isString({ regexp: /.+\..+\..+/i }))
            .withRequired('port', Rule.isNumber({ integer: true }))
            .withRequired('user', Rule.isString())
            .withRequired('pass', Rule.isString())
            .run(mailer_opts)
        ;
        const { host, port, user, pass } = mailer_opts;
        this._mailer_opts = mailer_opts;
        this._nodemailer = nodemailer;

        this._transporter = this._nodemailer.createTransport({
            host,
            port,
            secure: true,
            auth: { user, pass },
        });
        
        this._log = new Logger('Mailer');
        this._log.level = 'all';
    }

    async sendEmail(to, subject, html) {
        const info = await this._transporter.sendMail({ from: this._mailer_opts.user, to, subject, html });
        this._log.debug('Email send to mail address(es)', info.accepted.join(', '));
    }

    async sendVerificationLink(recepient_email, site_title, link, html) {
        const info = await this._transporter.sendMail({
            from: this._mailer_opts.user,
            to: recepient_email,
            subject: `Verification link for your ${site_title} account`,
            html: html.replace('<verification_link>', link),
        });

        this._log.debug('Verification link message send to email address(es)', info.accepted.join(', '));
    }

    async sendRestorePasswordLink(recepient_email, site_title, link, html) {
        const info = await this._transporter.sendMail({
            from: this._mailer_opts.user,
            to: recepient_email,
            subject: `Restore password link for your ${site_title} account`,
            html: html.replace('<restore_link>', link),
        });

        this._log.debug('Restore password link message send to email address(es)', info.accepted.join(', '));
    }
}

module.exports = Mailer;
