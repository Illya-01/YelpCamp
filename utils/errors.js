export class ExpressError extends Error {
    constructor(message, statusCode) {
        super()
        this.message = message
        this.statusCode = statusCode
    }
}

export const catchAsyncErr = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next)
    }
}
