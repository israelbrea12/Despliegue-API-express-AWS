/* Este middleware protege las rutas privadas verificando el token JWT. */

const { decodeAccessToken } = require("../auth");

module.exports = {
  verifyToken: (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) { 
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1] ?? ""; 

    const decoded = decodeAccessToken(token);

    if (decoded === null) { 
      return res.status(401).json({ message: "Unauthorized" });
    }


    console.log("Decoded userId:", decoded.id);
    req.userId = decoded.id; 

    next();
  },
};
