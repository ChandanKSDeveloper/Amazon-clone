/**
 * @description Async Handler Utility
 * A wrapper that eliminates the need for repetitive try-catch blocks in 
 * controller functions. It passes any caught errors to the next middleware.
 */
const asyncHandler = (passedFunction) => (req, res, next) => {
    Promise
        .resolve(passedFunction(req, res, next))
        .catch(next);
};

export default asyncHandler;
