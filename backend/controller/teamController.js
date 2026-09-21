const { User, Doctor, Clinic } = require("../models");
const { validateUser } = require("../validations/userValidation");
const { Op } = require("sequelize");

exports.getTeam = async (req, res) => {
    try {
        const team = await User.findAll({
            include: [
                { model: Doctor, as: "doctorProfile" },
                { model: Clinic, as: "clinic" },
            ],
            order: [["createdAt", "ASC"]],
        });
        res.status(200).send(team);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getMemberById = async (req, res) => {
    try {
        const member = await User.findByPk(req.params.id, {
            include: [{ model: Doctor, as: "doctorProfile" }],
        });
        if (!member) return res.status(404).send("Member not found");
        res.status(200).send(member);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.addMember = async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const user = await User.create(req.body);
        res.status(201).send(user);
    } catch (error) {
        res.status(500).send(error.message || error);
    }
};

exports.updateMember = async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).send("Member not found");

        await user.update(req.body);
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.removeMember = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).send("Member not found");

        if (user.role === "owner") {
            return res.status(403).send("Owner cannot be deleted");
        }

        const userData = user.toJSON();
        await user.destroy();
        res.status(200).send(userData);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.searchMember = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).send("Search query is required");
        }

        const members = await User.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${query}%` } },
                    { email: { [Op.iLike]: `%${query}%` } },
                    { phone: { [Op.iLike]: `%${query}%` } },
                ],
            },
            include: [{ model: Doctor, as: "doctorProfile" }],
        });

        res.status(200).send(members);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
