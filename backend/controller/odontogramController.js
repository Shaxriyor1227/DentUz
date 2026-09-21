const { Odontogram, OdontogramHistory, Patient, User } = require("../models");
const { validateOdontogramUpdate } = require("../validations/odontogramValidation");

exports.getOdontogramByPatient = async (req, res) => {
    try {
        let odontogram = await Odontogram.findOne({
            where: { patientId: req.params.patientId },
            include: [
                { model: OdontogramHistory, as: "history", limit: 20 },
                { model: Patient, as: "patient" },
            ],
        });

        if (!odontogram) {
            odontogram = await Odontogram.create({
                patientId: req.params.patientId,
                teeth: {},
            });
        }

        res.status(200).send(odontogram);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.saveOdontogram = async (req, res) => {
    const { error } = validateOdontogramUpdate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const { teeth, changedTooth, previousCondition, newCondition, notes } = req.body;
        const userId = req.user?.id || null;

        let odontogram = await Odontogram.findOne({
            where: { patientId: req.params.patientId },
        });

        if (!odontogram) {
            odontogram = await Odontogram.create({
                patientId: req.params.patientId,
                teeth,
                lastUpdatedBy: userId,
            });
        } else {
            await odontogram.update({ teeth, lastUpdatedBy: userId });
        }

        // Add history entry
        await OdontogramHistory.create({
            odontogramId: odontogram.id,
            patientId: req.params.patientId,
            snapshot: teeth,
            changedTooth,
            previousCondition,
            newCondition,
            notes,
            savedBy: userId,
        });

        res.status(200).send(odontogram);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getOdontogramHistory = async (req, res) => {
    try {
        const history = await OdontogramHistory.findAll({
            where: { patientId: req.params.patientId },
            include: [{ model: User, as: "author" }],
            order: [["createdAt", "DESC"]],
        });
        res.status(200).send(history);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Aliases
exports.getByPatient = exports.getOdontogramByPatient;
exports.save = exports.saveOdontogram;
exports.getHistory = exports.getOdontogramHistory;
