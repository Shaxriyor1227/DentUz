const jwt = require("jsonwebtoken");
const { User, Clinic } = require("../models");
const { validateLogin, validateUser } = require("../validations/userValidation");

const signTokens = (userId) => {
    const access = jwt.sign({ id: userId }, process.env.JWT_SECRET || "jwt_secret", {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
    const refresh = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || "jwt_refresh_secret", {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    });
    return { access, refresh };
};

exports.register = async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const existing = await User.findOne({ where: { email: req.body.email } });
        if (existing) return res.status(400).send("Email already exists");

        const user = await User.create(req.body);
        const { access, refresh } = signTokens(user.id);
        await user.update({ refreshToken: refresh });

        res.status(201).send({ token: access, refreshToken: refresh, user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.login = async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const { email, password } = req.body;
        const user = await User.scope("withSecrets").findOne({
            where: { email },
            include: [{ model: Clinic, as: "clinic" }],
        });

        if (!user) {
            return res.status(401).send("Email or password incorrect");
        }

        const valid = await user.comparePassword(password);
        if (!valid) {
            return res.status(401).send("Email or password incorrect");
        }

        const { access, refresh } = signTokens(user.id);
        await user.update({ refreshToken: refresh });

        const userPayload = {
            id: user.id,
            name: user.name,
            shortName: user.shortName,
            title: user.title,
            email: user.email,
            role: user.role,
            clinicId: user.clinicId,
            clinic: user.clinic,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
        };

        res.status(200).send({
            success: true,
            token: access,
            refreshToken: refresh,
            user: userPayload,
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).send("Refresh token is required");
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || "default_jwt_refresh_secret_key_1234567890"
        );
        const user = await User.scope("withSecrets").findByPk(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).send("Invalid refresh token");
        }

        const { access, refresh } = signTokens(user.id);
        await user.update({ refreshToken: refresh });

        res.status(200).send({ success: true, token: access, refreshToken: refresh });
    } catch (error) {
        res.status(401).send("Refresh token invalid or expired");
    }
};

exports.logout = async (req, res) => {
    try {
        if (req.user?.id) {
            await User.scope("withSecrets")
                .findByPk(req.user.id)
                .then((u) => u && u.update({ refreshToken: null }));
        }
        res.status(200).send({ success: true, message: "Logged out" });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.me = (req, res) => {
    res.status(200).send({ success: true, user: req.user });
};
