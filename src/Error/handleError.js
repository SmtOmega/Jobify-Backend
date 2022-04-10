const handleError = (err) => {
    let error = {} 
    if(err.code === 11000){
        error.email = "That email already exist"

    }

    if(err.message.includes('User validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            error[properties.path] = properties.message
        })
    }
    let errMessage = `${error.name || ''} ${error.email || ''}, ${error.password || ''}`
    return errMessage
}


module.exports = handleError