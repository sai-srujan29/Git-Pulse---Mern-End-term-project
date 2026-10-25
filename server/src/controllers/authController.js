import axios from 'axios';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/User.js';

const signToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const getGithubAuthUrl = (req, res) => {
  const scope = 'read:user,user:email,repo';
  const callbackUrl = config.github.callbackUrl || 'http://localhost:5000/api/auth/github/callback';
  const url = `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&scope=${encodeURIComponent(scope)}`;
  res.redirect(url);
};

export const handleGithubCallback = async (req, res, next) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${config.clientUrl}/login?error=missing_code`);
    }

    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.redirect(`${config.clientUrl}/login?error=oauth_failed`);
    }

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    const ghUser = userResponse.data;

    let email = ghUser.email;
    if (!email) {
      try {
        const emailsResponse = await axios.get(
          'https://api.github.com/user/emails',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/vnd.github+json',
            },
          }
        );
        const primaryEmail = emailsResponse.data.find(
          (e) => e.primary && e.verified
        );
        email = primaryEmail ? primaryEmail.email : '';
      } catch (e) {
        email = '';
      }
    }

    let user = await User.findOne({ githubId: String(ghUser.id) });

    if (user) {
      user.username = ghUser.login;
      user.displayName = ghUser.name || ghUser.login;
      user.email = email || user.email;
      user.avatarUrl = ghUser.avatar_url;
      user.profileUrl = ghUser.html_url;
      user.accessToken = accessToken;
      user.bio = ghUser.bio || '';
      user.publicRepos = ghUser.public_repos || 0;
      user.followers = ghUser.followers || 0;
      user.following = ghUser.following || 0;
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = await User.create({
        githubId: String(ghUser.id),
        username: ghUser.login,
        displayName: ghUser.name || ghUser.login,
        email: email || '',
        avatarUrl: ghUser.avatar_url,
        profileUrl: ghUser.html_url,
        accessToken,
        bio: ghUser.bio || '',
        publicRepos: ghUser.public_repos || 0,
        followers: ghUser.followers || 0,
        following: ghUser.following || 0,
        lastLogin: new Date(),
      });
    }

    const token = signToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${config.clientUrl}/auth/callback?token=${token}`);
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
