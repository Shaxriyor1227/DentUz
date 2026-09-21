const { Appointment, Patient, Doctor, Clinic } = require("../models");
const { validateAppointment } = require("../validations/appointmentValidation");
const { Op } = require("sequelize");

exports.createAppointment = async (req, res) => {
    const { error } = validateAppointment(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const appointment = await Appointment.create(req.body);
        res.status(201).send(appointment);
    } catch (error) {
        res.status(500).send(error.message || error);
    }
};

exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            include: [
                { model: Patient, as: "patient" },
                { model: Doctor, as: "doctor" },
            ],
            order: [["date", "ASC"], ["time", "ASC"]],
        });
        res.status(200).send(appointments);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [
                { model: Patient, as: "patient" },
                { model: Doctor, as: "doctor" },
                { model: Clinic, as: "clinic" },
            ],
        });
        if (!appointment) return res.status(404).send("Appointment not found");
        res.status(200).send(appointment);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getTodayAppointments = async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const appointments = await Appointment.findAll({
            where: { date: today },
            include: [
                { model: Patient, as: "patient" },
                { model: Doctor, as: "doctor" },
            ],
            order: [["time", "ASC"]],
        });
        res.status(200).send(appointments);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.updateAppointment = async (req, res) => {
    const { error } = validateAppointment(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const appointment = await Appointment.findByPk(req.params.id);
        if (!appointment) return res.status(404).send("Appointment not found");

        await appointment.update(req.body);
        res.status(200).send(appointment);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id);
        if (!appointment) return res.status(404).send("Appointment not found");

        const appointmentData = appointment.toJSON();
        await appointment.destroy();
        res.status(200).send(appointmentData);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.searchAppointment = async (req, res) => {
    try {
        console.log("Query received:", req.query.query);
        const { query } = req.query;
        if (!query) {
            return res.status(400).send("Search query is required");
        }

        const appointments = await Appointment.findAll({
            where: {
                [Op.or]: [
                    { patientName: { [Op.iLike]: `%${query}%` } },
                    { procedure: { [Op.iLike]: `%${query}%` } },
                    { doctorName: { [Op.iLike]: `%${query}%` } },
                ],
            },
            include: [
                { model: Patient, as: "patient" },
                { model: Doctor, as: "doctor" },
            ],
        });

        res.status(200).send(appointments);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Aliases for compatibility
exports.getAll = exports.getAppointments;
exports.getToday = exports.getTodayAppointments;
exports.getById = exports.getAppointmentById;
exports.create = exports.createAppointment;
exports.update = exports.updateAppointment;
exports.remove = exports.deleteAppointment;
exports.search = exports.searchAppointment;
