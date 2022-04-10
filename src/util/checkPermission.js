

const checkPermissions = (requestUser, resourceUserId) => {
    if(requestUser._id.toString() === resourceUserId.toString()) return
    throw new Error("You are not authorized to access this route")
}

module.exports = checkPermissions