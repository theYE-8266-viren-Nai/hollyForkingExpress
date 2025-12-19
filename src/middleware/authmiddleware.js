import jwt from 'jsonwebtoken'

function authMiddleware(req,res,next) {
    const authHeader = req.headers['authorization'];

    if(!authHeader) {
        return res.status(401).json({message : "No token"})
    }

    //expected format for the bearer token
    const token = authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({message : 'Token malformed'})
    }
    jwt.verify(token , process.env.JWT_SECRET , (err , decoded ) => {
        if (err){
            return res.status(401).json({message : "Invalid token"})
        }
        req.userId = decoded.id;
        next();
    })
}
export default authMiddleware;