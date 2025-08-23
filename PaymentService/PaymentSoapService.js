const mongoose = require("mongoose");
const Payment = require("./models/payment.model");

const PaymentSoapService = {
    PaymentService: {
        PaymentServicePort: {
            createPayment: async (args, callback) => {
                try {
                    const { orderId, userId, amount, method } = args.payment;
                    const newPayment = new Payment({ orderId, userId, amount, method, status: "pending" });
                    await newPayment.save();
                    callback(null, { payment: newPayment.toObject() });
                } catch (error) {
                    console.error("Error creating payment (SOAP):", error);
                    callback({ SoapFault: { faultcode: "Server", faultstring: error.message } });
                }
            },

            getPaymentById: async (args, callback) => {
                try {
                    if (!mongoose.Types.ObjectId.isValid(args.paymentId)) {
                        throw new Error("Invalid Payment ID");
                    }
                    const payment = await Payment.findById(args.paymentId);
                    if (!payment) {
                        throw new Error("Payment not found");
                    }
                    callback(null, { payment: payment.toObject() });
                } catch (error) {
                    console.error("Error getting payment by ID (SOAP):", error);
                    callback({ SoapFault: { faultcode: "Server", faultstring: error.message } });
                }
            },

            getAllPayments: async (args, callback) => {
                try {
                    const payments = await Payment.find({});
                    callback(null, { payment: payments.map(p => p.toObject()) });
                } catch (error) {
                    console.error("Error getting all payments (SOAP):", error);
                    callback({ SoapFault: { faultcode: "Server", faultstring: error.message } });
                }
            },

            updatePaymentStatus: async (args, callback) => {
                try {
                    if (!mongoose.Types.ObjectId.isValid(args.paymentId)) {
                        throw new Error("Invalid Payment ID");
                    }
                    const updatedPayment = await Payment.findByIdAndUpdate(
                        args.paymentId,
                        { status: args.status },
                        { new: true }
                    );
                    if (!updatedPayment) {
                        throw new Error("Payment not found");
                    }
                    callback(null, { payment: updatedPayment.toObject() });
                } catch (error) {
                    console.error("Error updating payment status (SOAP):", error);
                    callback({ SoapFault: { faultcode: "Server", faultstring: error.message } });
                }
            },
        },
    },
};

module.exports = PaymentSoapService;
