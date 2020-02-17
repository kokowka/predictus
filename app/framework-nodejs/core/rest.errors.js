/* eslint-disable max-classes-per-file */
'use strict';

const VALIDATION_ERROR_STATUS = 400,
      UNAUTHORIZED_ERROR_STATUS = 401,
      FORBIDDEN_ERROR_STATUS = 403,
      NOT_FOUND_ERROR_STATUS = 404,
      CONFLICT_ERROR_STATUS = 409,
      GONE_ERROR_STATUS = 410,
      PRECONDITION_FAILED_STATUS = 412,
      INTERNAL_ERROR_STATUS = 500,
      SERVICE_UNAVAILABLE_STATUS = 502
;

/**
 * Parent class for REST API errors.
 */
const RestError = class RestError extends Error {
    /**
     * 
     * @param {Class} clss error class
     * @param {String} message error message
     * @param {Number} status error status code
     */
    constructor(clss, message, status) {
        super(message);

        /**
         * Error name
         * @type {String}
         */
        this.name = clss.name;
      
        /**
         * Error status code
         * @type {Number}
         */
        this.status = status;

        Error.captureStackTrace(this, clss);
    }
};

/**
 * This class was built for 404 (Not Found) errors creation.
 */
const NotFoundError = class NotFoundError extends RestError {
  
    /**
     * Creates 404 error instance
     * @param {String} message error message
     */
    constructor(message) {
        super(NotFoundError, message, NOT_FOUND_ERROR_STATUS);
    }
};

/**
 * This class was built for 400 (Validation) errors creation.
 */
const ValidationError = class ValidationError extends RestError {
  
    /**
     * Creates 400 error instance
     * @param {String} message error message
     */
    constructor(message) {
        super(ValidationError, message, VALIDATION_ERROR_STATUS);
    }
};

/**
 * This class was built for 403 (Forbidden) errors creation.
 */
const ForbiddenError = class ForbiddenError extends RestError {

    /**
     * Creates 403 error instance
     * @param {String} message error message
     */
    constructor(message) {
        super(ForbiddenError, message, FORBIDDEN_ERROR_STATUS);
    }
};

/**
 * This class was built for 401 (Unauthorized) errors creation.
 */
const UnauthorizedError = class UnauthorizedError extends RestError {

    /**
     * Creates 401 error instance
     * @param {String} message error message
     */
    constructor(message) {
        super(UnauthorizedError, message, UNAUTHORIZED_ERROR_STATUS);
    }
};

/**
 * This class was built for 409 (Conflict) errors creation
 */
const ConflictError = class ConflictError extends RestError {

    /**
     * Creates 409 error instance
     * @param {String} message error message
     */
    constructor(message) {
        super(ConflictError, message, CONFLICT_ERROR_STATUS);
    }
};

/**
 * This class was built for 412 (Precondition Failed) errors creation
 */
const PreconditionFailed = class PreconditionFailed extends RestError {

    /**
     * Createds 412 error instance
     * @param {String} message error message
     */
    constructor(message) {
        super(PreconditionFailed, message, PRECONDITION_FAILED_STATUS);
    }
};

/**
 * This class was built for 410 (Gone) errors creation
 */
const GoneError = class GoneError extends RestError {

    /**
     * Creates 410 error instance
     * @param {String} message error message
     */
    constructor(message) {
        super(GoneError, message, GONE_ERROR_STATUS);
    }
}

/**
 * This class was built for 500 (Internal Server) errors creation. This is the default error code
 */
const InternalError = class InternalError extends RestError {

    /**
     * Creates 500 error instance
     * @param {String} message error message
     */
    constructor(message) {
        super(InternalError, message, INTERNAL_ERROR_STATUS);
    }
};

/**
 * This class was built for 502 (Service Unavailable) errors creation
 */
const ServiceUnavailable = class ServiceUnavailable extends RestError {
    /**
     * Creates 502 error instance
     * @param {String} message error message
     */
    constructor(message) {
        super(ServiceUnavailable, message, SERVICE_UNAVAILABLE_STATUS);
    }
};

module.exports = {
    RestError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    GoneError,
    PreconditionFailed,
    InternalError,
    ServiceUnavailable,
};
