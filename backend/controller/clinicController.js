const { Clinic, User, Doctor, Patient, Appointment, Invoice } = require("../models");
const { validateClinic } = require("../validations/clinicValidation");

// GET /api/clinics
exports.getClinics = async (req, res) => {
    try {
        const clinics = await Clinic.findAll();
        res.status(200).send(clinics);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// GET /api/clinics/:id
exports.getClinicById = async (req, res) => {
    try {
        const clinic = await Clinic.findByPk(req.params.id, {
            include: [
                { model: User,   as: "users",   attributes: ["id", "name", "role", "email"] },
                { model: Doctor, as: "doctors", attributes: ["id", "userId", "specialization", "cabinetNumber"] },
            ],
        });
        if (!clinic) return res.status(404).send("Clinic not found");
        res.status(200).send(clinic);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// POST /api/clinics
exports.createClinic = async (req, res) => {
    const { error } = validateClinic(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const clinic = await Clinic.create(req.body);
        res.status(201).send(clinic);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// PUT /api/clinics/:id
exports.updateClinic = async (req, res) => {
    const { error } = validateClinic(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const clinic = await Clinic.findByPk(req.params.id);
        if (!clinic) return res.status(404).send("Clinic not found");
        await clinic.update(req.body);
        res.status(200).send(clinic);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// DELETE /api/clinics/:id
exports.deleteClinic = async (req, res) => {
    try {
        const clinic = await Clinic.findByPk(req.params.id);
        if (!clinic) return res.status(404).send("Clinic not found");
        const data = clinic.toJSON();
        await clinic.destroy();
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// GET /api/clinics/:id/stats — klinika statistikasi
exports.getClinicStats = async (req, res) => {
    try {
        const clinicId = req.params.id;

        const [usersCount, patientsCount, appointmentsCount, invoicesCount] = await Promise.all([
            User.count({ where: { clinicId } }),
            Patient.count({ where: { clinicId } }),
            Appointment.count({ where: { clinicId } }),
            Invoice.count({ where: { clinicId } }),
        ]);

        res.status(200).send({
            clinicId,
            usersCount,
            patientsCount,
            appointmentsCount,
            invoicesCount,
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};
