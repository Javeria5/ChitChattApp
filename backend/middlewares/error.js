const  NotFound = (req,res,next) =>{
    const error = new Error (`Not Found - ${req.originaUrl}`)
    res.status(404)
    next(error)
};

const ErrorHandlers = (err, req, res, next) => {
  if (res.headersSent) {
    // If headers have already been sent, pass the error to the next middleware
    return next(err);
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};



module.exports = {NotFound,ErrorHandlers}