const { Invoice, Patient, Clinic } = require("../models");
const { validateInvoice } = require("../validations/invoiceValidation");
const { Op } = require("sequelize");

exports.createInvoice = async (req, res) => {
    const { error } = validateInvoice(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const invoice = await Invoice.create(req.body);
        res.status(201).send(invoice);
    } catch (error) {
        res.status(500).send(error.message || error);
    }
};

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            include: [
                { model: Patient, as: "patientRecord" },
            ],
            order: [["date", "DESC"]],
        });
        res.status(200).send(invoices);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                { model: Patient, as: "patientRecord" },
                { model: Clinic, as: "clinic" },
            ],
        });
        if (!invoice) return res.status(404).send("Invoice not found");
        res.status(200).send(invoice);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.updateInvoice = async (req, res) => {
    const { error } = validateInvoice(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) return res.status(404).send("Invoice not found");

        await invoice.update(req.body);
        res.status(200).send(invoice);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) return res.status(404).send("Invoice not found");

        const invoiceData = invoice.toJSON();
        await invoice.destroy();
        res.status(200).send(invoiceData);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.searchInvoice = async (req, res) => {
    try {
        console.log("Query received:", req.query.query);
        const { query } = req.query;
        if (!query) {
            return res.status(400).send("Search query is required");
        }

        const invoices = await Invoice.findAll({
            where: {
                [Op.or]: [
                    { patient: { [Op.iLike]: `%${query}%` } },
                    { doctor: { [Op.iLike]: `%${query}%` } },
                    { procedure: { [Op.iLike]: `%${query}%` } },
                ],
            },
            include: [{ model: Patient, as: "patientRecord" }],
        });

        res.status(200).send(invoices);
    } catch (error) {
        res.status(500).send(error.message);
    }
};


exports.getStats = async (req, res) => {
    try {
        const { period = "this_month" } = req.query;
        const now = new Date();
        let start, end;

        if (period === "this_month") {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        } else if (period === "last_month") {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        } else {
            start = new Date(now - 30 * 24 * 60 * 60 * 1000);
            end = now;
        }

        const baseWhere = { date: { [Op.between]: [start, end] } };

        const [paidSum, pendingSum, pendingCount] = await Promise.all([
            Invoice.sum("amount", { where: { ...baseWhere, status: "paid" } }),
            Invoice.sum("amount", { where: { ...baseWhere, status: { [Op.in]: ["pending", "partial"] } } }),
            Invoice.count({ where: { ...baseWhere, status: { [Op.in]: ["pending", "partial"] } } }),
        ]);

        res.status(200).send({
            monthlyRevenue: paidSum || 0,
            pendingPayments: pendingSum || 0,
            pendingCount: pendingCount || 0,
            expenses: 0,
            netProfit: paidSum || 0,
            label: period,
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Aliases
exports.updateStatus = async (req, res) => {
    try {
        const inv = await Invoice.findByPk(req.params.id);
        if (!inv) return res.status(404).send("Invoice not found");
        await inv.update({ status: req.body.status });
        res.status(200).send(inv);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
