const jwt=require('jsonwebtoken');
const User=require('../model/user');
/**
 * Authenticate Socket Middleware
 * 
 * Middleware for authenticate websocket connection 
 * it verifies the token provided in the socket.handshakes.auth.token and attaches the user 
 * 
 * @param{object} socket =Socket.io socket object
 * @param {function} next =The next middleware function
 * 
 */
exports.authenticateSocket =async(socket,next)=>{
    const token=socket.handshake.auth.token;

    if(!token){
        return next(new Error("Authentication error:Token missing"))
    }
    try{
        const secretKey=process.env.SECRET_KEY;
        const decodedId=jwt.verify(token,secretKey);
        const loggedUser = await User.findByPk(decodedId.userId );
        socket.user=loggedUser;
        next();
    }catch(error){
        console.log(error);
        res.status(500).json({error:"Internal Server Error"})
    }
}
