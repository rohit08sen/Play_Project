//read documentation node api error
class ApiError extends Error{
  constructor(
    statusCode,
    message = "Something Went Wrong",
    errors = [],
    statck=""
  ) { 
    super(message)
    this.statusCode = statusCode
    this.data = null//learn document about this
    this.message = message
    this.success = false;
    this.errors = errors
    
    //not needed this code
    if (statck) {//give track kis kis file mein error hai
      this.stack=statck
    } else {
      Error.captureStackTrace(this,this.constructor)
    }
  }
}

export {ApiError}