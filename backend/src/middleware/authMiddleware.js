import jwt from "jsonwebtoken";

export const protect = (roles = []) => {
  // Ensure roles is always an array
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    try {
      const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
      req.user = decoded;

      // If roles are specified, check if the user's role is allowed
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden: Insufficient role" });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
};
