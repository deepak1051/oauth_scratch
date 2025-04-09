import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Token from '../models/Token.js';
import { generateTokens } from '../utils/token.util.js';
import { v4 as uuidv4 } from 'uuid';

// STEP 1: Redirect to Google login
export const googleLogin = (req, res) => {
  const redirect_uri =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile`;

  res.redirect(redirect_uri);
};

// STEP 2: Handle Google callback
export const googleCallback = async (req, res) => {
  const { code } = req.query;
  console.log('code', code);
  try {
    // 1. Exchange code for tokens
    const tokenRes = await axios.post(
      `https://oauth2.googleapis.com/token`,
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { access_token, id_token } = tokenRes.data;

    console.log('access_token', access_token);

    // 2. Get user info

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const { sub, email, name, picture } = userRes.data;

    // 3. Find or create user
    let user = await User.findOne({ provider: 'google', providerId: sub });
    if (!user) {
      user = await User.create({
        provider: 'google',
        providerId: sub,
        email,
        name,
        avatar: picture,
      });
    }

    // 4. Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // 5. Store refresh token in DB
    await Token.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // 6. Send tokens in secure cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 7. Redirect to frontend

    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (err) {
    console.error('Google OAuth Error:', err.message);
    res.status(500).send('Authentication failed');
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await Token.deleteOne({ refreshToken });
    }

    res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });

    res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Logout error');
  }
};

export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    // 1. Validate token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 2. Check if token exists in DB
    const storedToken = await Token.findOne({ refreshToken });
    if (!storedToken) {
      return res.status(403).json({ message: 'Token no longer valid' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 3. Generate new access token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // 4. Set new access token cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: 'Access token refreshed' });
  } catch (err) {
    console.error('Refresh Error:', err);
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};
