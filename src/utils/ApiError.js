//read documentation node api error
class ApiError extends Error{
  constructor(
    statusCode,
    message = "Something Went Wrong",
    errors = [],
    stack=""
  ) { 
    super(message)
    this.statusCode = statusCode
    this.data = null//learn document about this
    this.message = message
    this.success = false;
    this.errors = errors
    
    //not needed this code
    if (stack) {//give track kis kis file mein error hai
      this.stack=stack
    } else {
      Error.captureStackTrace(this,this.constructor)
    }
  }
}

export {ApiError}