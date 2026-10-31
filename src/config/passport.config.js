import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";

import {
  getUserByEmail,
  saveUser
} from "../repositories/users.repository.js";

import {
  hashPassword,
  comparePassword
} from "../utils/hash.js";

import { JWT_SECRET } from "./env.config.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cookieExtractor = (req) => {
  return req?.cookies?.currentUser ?? null;
};

passport.use(
  "register",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
      session: false
    },
    async (req, email, password, done) => {
      try {
        const { first_name, last_name } = req.body ?? {};

        if (
          typeof first_name !== "string" ||
          !first_name.trim() ||
          typeof last_name !== "string" ||
          !last_name.trim() ||
          typeof email !== "string" ||
          typeof password !== "string"
        ) {
          return done(null, false, {
            statusCode: 400,
            message: "Faltan campos obligatorios"
          });
        }

        if (!emailRegex.test(email.trim())) {
          return done(null, false, {
            statusCode: 400,
            message: "El email no tiene un formato válido"
          });
        }

        if (password.length < 6) {
          return done(null, false, {
            statusCode: 400,
            message: "La contraseña debe tener al menos 6 caracteres"
          });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await getUserByEmail(normalizedEmail);

        if (existingUser) {
          return done(null, false, {
            statusCode: 409,
            message: "El email ya está registrado"
          });
        }

        const hashedPassword = await hashPassword(password);

        const user = await saveUser({
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: "user"
        });

        return done(null, {
          id: user._id.toString(),
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role
        });
      } catch (error) {
        if (error.code === 11000) {
          return done(null, false, {
            statusCode: 409,
            message: "El email ya está registrado"
          });
        }

        return done(error);
      }
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false
    },
    async (email, password, done) => {
      try {
        if (
          typeof email !== "string" ||
          !email.trim() ||
          typeof password !== "string" ||
          !password
        ) {
          return done(null, false, {
            statusCode: 400,
            message: "Faltan campos obligatorios"
          });
        }

        const user = await getUserByEmail(email.trim().toLowerCase());

        if (!user || !(await comparePassword(password, user.password))) {
          return done(null, false, {
            statusCode: 401,
            message: "Credenciales inválidas"
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  "current",
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: JWT_SECRET,
      passReqToCallback: true
    },
    (req, payload, done) => {
      const { id, email, role } = payload;

      if (!id || !email || !role) {
        return done(null, false);
      }

      return done(null, { id, email, role });
    }
  )
);

export default passport;
