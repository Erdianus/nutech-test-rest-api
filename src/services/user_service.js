import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query, withTransaction } from "../utils/sql.js";
import { json } from "stream/consumers";

const fsp = fs.promises;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function register({ first_name, last_name, email, password }) {
  const existing = await query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length) {
    const e = new Error("Email sudah terdaftar");
    e.status = 409;
    throw e;
  }
  const hash = await bcrypt.hash(password, 10);

  return await withTransaction(async (conn) => {
    const [resUser] = await conn.execute(
      "INSERT INTO users(first_name,last_name,email,password) VALUES (?,?,?,?)",
      [first_name, last_name, email, hash]
    );
    const userId = resUser.insertId;
    await conn.execute("INSERT INTO wallets(user_id,balance) VALUES (?,0)", [
      userId,
    ]);
    return {
      status: 0,
      message: "Registrasi berhasil silahkan login",
      data: null,
    };
  });
}

async function login({ email, password }) {
  const [user] = await query(
    "SELECT id, email, password FROM users WHERE email = ?",
    [email]
  );
  if (!user) {
    const error = new Error("Username atau password salah");
    error.status = 103;
    error.httpStatus = 401;
    throw error;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const error = new Error("Username atau password salah");
    error.status = 103;
    error.httpStatus = 401;
    throw error;
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "1d" }
  );
  return { status: 0, message: "Login sukses", data: { token: token } };
}

async function getProfile({ userId, baseUrl }) {
  const rows = await query("SELECT * FROM users WHERE id = ?", [userId]);
  if (!rows.length) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }
  const user = rows[0];

  // Build full URL for profile image if it exists and baseUrl is provided
  const profileImageUrl =
    user.profile_image && baseUrl
      ? `${baseUrl.replace(/\/$/, "")}${user.profile_image}`
      : null;

  return {
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    profile_image: profileImageUrl,
  };
}

async function editUser({ userId, first_name, last_name, baseUrl }) {
  const rows = await query("SELECT * FROM users WHERE id = ?", [userId]);
  if (!rows.length) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }

  await withTransaction(async (conn) => {
    await conn.execute(
      "UPDATE users SET first_name = ?, last_name = ? WHERE id = ?",
      [first_name, last_name, userId]
    );
  });

  const [updatedUser] = await query(
    "SELECT email, first_name, last_name, profile_image FROM users WHERE id = ?",
    [userId]
  );

  const profileImageUrl =
    updatedUser.profile_image && baseUrl
      ? `${baseUrl.replace(/\/$/, "")}${updatedUser.profile_image}`
      : null;

  return {
    status: 0,
    message: "Update profile berhasil",
    data: {
      email: updatedUser.email,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      profile_image: profileImageUrl,
    },
  };
}

async function uploadProfileImage({ userId, file, baseUrl }) {
  // Validate file
  if (!file) {
    const error = new Error("Profile image wajib diunggah");
    error.status = 102;
    error.httpStatus = 400;
    throw error;
  }

  if (!file.originalname || (!file.path && !file.buffer)) {
    const error = new Error("Format Image tidak sesuai");
    error.status = 102;
    error.httpStatus = 400;
    throw error;
  }

  const uploadsDir = path.join(__dirname, "..", "..", "public", "uploads");
  await fsp.mkdir(uploadsDir, { recursive: true });
  let ext = (path.extname(file.originalname) || "").toLowerCase();
  const fileName = `profile_${userId}_${Date.now()}${ext}`;
  const destPath = path.join(uploadsDir, fileName);

  try {
    if (file.path) {
      await fsp.copyFile(file.path, destPath);
    } else if (file.buffer) {
      await fsp.writeFile(destPath, file.buffer);
    } else {
      const error = new Error("Format Image tidak sesuai");
      error.status = 102;
      error.httpStatus = 400;
      throw error;
    }

    const publicUrl = `/uploads/${fileName}`; // assume server serves `public` as static

    // update DB in a transaction; if update fails we'll remove saved file
    const result = await withTransaction(async (conn) => {
      await conn.execute("UPDATE users SET profile_image = ? WHERE id = ?", [
        publicUrl,
        userId,
      ]);
      return true;
    });

    const fullUrl = baseUrl
      ? `${baseUrl.replace(/\/$/, "")}${publicUrl}`
      : publicUrl;
    const [user] = await query(
      "SELECT email, first_name, last_name FROM users WHERE id = ?",
      [userId]
    );
    if (!user) {
      const error = new Error("User tidak ditemukan");
      error.status = 102;
      error.httpStatus = 404;
      throw error;
    }

    return {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_image: fullUrl,
    };
  } catch (err) {
    // attempt to remove file if it was written
    try {
      await fsp.unlink(destPath);
    } catch (_) {}
    throw err;
  }
}

export { register, login, getProfile, editUser, uploadProfileImage };
