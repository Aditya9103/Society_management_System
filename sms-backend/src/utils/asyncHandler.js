/**
 * asyncHandler — Wraps async route handlers to eliminate try/catch boilerplate.
 *
 * Any unhandled promise rejection is forwarded to Express's next(err),
 * which is then processed by the global error middleware.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => {
 *     const data = await someService.fetch();
 *     res.json(new ApiResponse(200, data));
 *   }));
 *
 * @param {Function} fn - Async express route handler
 * @returns {Function}  - Express-compatible middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err)=> next(err));
};

export default asyncHandler;
// const asyncHandler = (fun) => async (req,res,next) => {
//   try {
//     await fun(req,res,next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success:false,
//       message:error.message
//     })
//   }
// }
// export {asyncHandler}