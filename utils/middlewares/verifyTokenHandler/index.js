const verifyTokenHandler =(req, res, next)=>{
    const bearerHeader =  req.headers['authorization'];
    const bearerParam =  req.query.access_token;
    if(typeof bearerHeader !== 'undefined'){
         const bearerToken = bearerHeader.split(" ")[1];
         req.token  = bearerToken;
         next();
    }else if(typeof bearerParam !== 'undefined'){
        const bearerToken = bearerParam.split(" ")[1];
        req.token  = bearerToken;
        next();
    }
    else{
        res.sendStatus(403);
    }
}

module.exports={verifyTokenHandler}