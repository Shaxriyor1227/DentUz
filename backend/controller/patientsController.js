const { Patient, Clinic, Appointment, Invoice, Odontogram } = require("../models");
const { validatePatient } = require("../validations/patientValidation");
const { Op } = require("sequelize");

exports.createPatient = async (req, res) => {
    const { error } = validatePatient(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const patient = await Patient.create(req.body);
        res.status(201).send(patient);
    } catch (error) {
        res.status(500).send(error.message || error);
    }
};

exports.getPatients = async (req, res) => {
    try {
        const patients = await Patient.findAll({
            include: [
                { model: Appointment, as: "appointments" },
                { model: Odontogram, as: "odontogram" },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.status(200).send(patients);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id, {
            include: [
                { model: Appointment, as: "appointments" },
                { model: Invoice, as: "invoices" },
                { model: Odontogram, as: "odontogram" },
            ],
        });
        if (!patient) return res.status(404).send("Patient not found");
        res.status(200).send(patient);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.updatePatient = async (req, res) => {
    const { error } = validatePatient(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const patient = await Patient.findByPk(req.params.id);
        if (!patient) return res.status(404).send("Patient not found");

        await patient.update(req.body);
        res.status(200).send(patient);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        if (!patient) return res.status(404).send("Patient not found");

        const patientData = patient.toJSON();
        await patient.destroy();
        res.status(200).send(patientData);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.searchPatient = async (req, res) => {
    try {
        console.log("Query received:", req.query.query);
        const { query } = req.query;
        if (!query) {
            return res.status(400).send("Search query is required");
        }

        const patients = await Patient.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${query}%` } },
                    { phone: { [Op.iLike]: `%${query}%` } },
                    { id: { [Op.iLike]: `%${query}%` } },
                ],
            },
        });

        res.status(200).send(patients);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Aliases for compatibility
exports.getAll = exports.getPatients;
exports.getById = exports.getPatientById;
exports.create = exports.createPatient;
exports.update = exports.updatePatient;
exports.remove = exports.deletePatient;
exports.search = exports.searchPatient;
