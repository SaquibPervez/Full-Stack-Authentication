// ══════════════════════════════════════════════════
// catchAsync — Async Error Wrapper
// Eliminates repetitive try/catch in controllers.
//
// BEFORE:
//   export const getUser = async (req, res, next) => {
//     try { ... } catch (err) { next(err); }
//   };
//
// AFTER:
//   export const getUser = catchAsync(async (req, res) => {
//     ...
//   });
// ══════════════════════════════════════════════════

export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
