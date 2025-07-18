const { loginSchema } = require("../../validators/auth-validator");
const { Account } = require("../../models/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../ultis/token");

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      EM: error.details[0].message,
      EC: 1,
    });
  }
  //console.log(email, password)
  try {
    const user = await Account.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        EM: "Email không tồn tại",
        EC: 2,
      });
    }

    const validatedPassword = await bcrypt.compare(password, user.password);
    if (!validatedPassword) {
      return res.status(400).json({
        EM: "Mật khẩu không chính xác",
        EC: 2,
      });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    // lưu refresh token vào cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      EM: "Đăng nhập thành công",
      EC: 0,
      DT: {
        access_token: accessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          isExpert: user.isExpert,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    //console.log(req.cookies)
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        EM: "Không tìm thấy refresh token",
        EC: 1,
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await Account.findByPk(decoded.userId);

    const newAccessToken = generateAccessToken(user.id, user.role);
    return res.status(200).json({
      EM: "Làm mới token thành công",
      EC: 0,
      DT: {
        access_token: newAccessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          isExpert: user.isExpert,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, refreshToken };
