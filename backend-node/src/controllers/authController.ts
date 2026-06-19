import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, AuthProvider, Role, UserStatus } from '../models/User';
import { config } from '../config/env';
import { AuthRequest } from '../middlewares/authMiddleware';

const client = new OAuth2Client(config.googleClientId);

const generateToken = (id: string) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: '30d',
  });
};

const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: '90d',
  });
};

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email và password là bắt buộc' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email đã được sử dụng' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      passwordHash,
      fullName: fullName || username,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      authProvider: AuthProvider.LOCAL,
      level: 1,
      exp: 0,
    });

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      accessToken: token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        level: user.level,
        exp: user.exp,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi server khi đăng ký' });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'username và password là bắt buộc' });
    }

    const user = await User.findOne({ username });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      accessToken: token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        level: user.level,
        exp: user.exp,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
  }
};

// POST /api/auth/refresh
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Refresh token là bắt buộc' });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User không tồn tại' });
    }

    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      accessToken: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        level: user.level,
        exp: user.exp,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn' });
  }
};

export const googleLogin = async (req: AuthRequest, res: Response) => {
  try {
    const token = req.body.token || req.body.idToken;

    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (user) {
      // Link account if it was LOCAL, or just update
      if (user.authProvider === AuthProvider.LOCAL) {
        user.authProvider = AuthProvider.GOOGLE;
        user.providerId = googleId;
      }
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      const generatedUsername = `google_${Math.random().toString(36).substring(2, 10)}`;
      user = await User.create({
        username: generatedUsername,
        email,
        fullName: name,
        authProvider: AuthProvider.GOOGLE,
        providerId: googleId,
        role: Role.USER,
        status: UserStatus.ACTIVE,
        level: 1,
        exp: 0,
        lastLoginAt: new Date(),
      });
    }

    const jwtToken = generateToken(user.id);
    const jwtRefreshToken = generateRefreshToken(user.id);

    res.json({
      accessToken: jwtToken,
      refreshToken: jwtRefreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        level: user.level,
        exp: user.exp,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

// GET /api/auth/me
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (user) {
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      level: user.level,
      exp: user.exp,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
