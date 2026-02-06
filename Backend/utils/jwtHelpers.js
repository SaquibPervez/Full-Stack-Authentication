import jwt from 'jsonwebtoken'

export const generateAccessToken = (user) => {
  const secret = process.env.ACCESS_TOKEN_SECRET
  return jwt.sign(
    { id: user.id, email: user.email },
    secret,
    { expiresIn: '2m' }
  );
}

export const generateRefreshToken = (user) => {
  const secret = process.env.REFRESH_TOKEN_SECRET
  return jwt.sign(
    { id: user.id, email: user.email },
    secret,
    { expiresIn: '7d' }
  );
}


export const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token provided" });
  try {
    const user = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken(user);
    res.json({ accessToken, user: { id: user.id, email: user.email } });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};