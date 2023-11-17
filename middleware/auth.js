const jwt = require("jsonwebtoken");

module.exports = {
  authorization: (req, res, next) => {
        const token = req.headers.authorization?.split(" ")[1]; 
    if (token) {
      try {
        const decodedToken = jwt.verify(token,process.env.SECRET_KEY);
        if (decodedToken) {
            req.userId = decodedToken._id;
        } else {
           console.log("authorization failed"); 
        }
     
      } catch (error) {
        console.log("Error verifying token:", error.message);
      }
    } else {
      console.log("Authorization header not found");
    }

    next(); 
  },
};
