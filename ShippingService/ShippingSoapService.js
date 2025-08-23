const mongoose = require("mongoose");
const Shipping = require("./models/shipping.model");

const ShippingSoapService = {
    ShippingService: {
        ShippingServicePort: {
            createShipping: async (args, callback) => {
                try {
                    const { orderId, userId, address } = args.shipping;
                    const newShipping = new Shipping({ orderId, userId, address, status: "pending" });
                    await newShipping.save();
                    callback(null, { shipping: newShipping.toObject() });
                } catch (error) {
                    console.error("Error creating shipping (SOAP):", error);
                    callback({ SoapFault: { faultcode: "Server", faultstring: error.message } });
                }
            },

            getShippingById: async (args, callback) => {
                try {
                    if (!mongoose.Types.ObjectId.isValid(args.shippingId)) {
                        throw new Error("Invalid Shipping ID");
                    }
                    const shipping = await Shipping.findById(args.shippingId);
                    if (!shipping) {
                        throw new Error("Shipping not found");
                    }
                    callback(null, { shipping: shipping.toObject() });
                } catch (error) {
                    console.error("Error getting shipping by ID (SOAP):", error);
                    callback({ SoapFault: { faultcode: "Server", faultstring: error.message } });
                }
            },

            getAllShippings: async (args, callback) => {
                try {
                    const shippings = await Shipping.find({});
                    callback(null, { shipping: shippings.map(s => s.toObject()) });
                } catch (error) {
                    console.error("Error getting all shippings (SOAP):", error);
                    callback({ SoapFault: { faultcode: "Server", faultstring: error.message } });
                }
            },

            updateShippingStatus: async (args, callback) => {
                try {
                    if (!mongoose.Types.ObjectId.isValid(args.shippingId)) {
                        throw new Error("Invalid Shipping ID");
                    }
                    const updatedShipping = await Shipping.findByIdAndUpdate(
                        args.shippingId,
                        { status: args.status },
                        { new: true }
                    );
                    if (!updatedShipping) {
                        throw new Error("Shipping not found");
                    }
                    callback(null, { shipping: updatedShipping.toObject() });
                } catch (error) {
                    console.error("Error updating shipping status (SOAP):", error);
                    callback({ SoapFault: { faultcode: "Server", faultstring: error.message } });
                }
            },

            deleteShipping: async (args, callback) => {
                try {
                    if (!mongoose.Types.ObjectId.isValid(args.shippingId)) {
                        throw new Error("Invalid Shipping ID");
                    }
                    const deletedShipping = await Shipping.findByIdAndDelete(args.shippingId);
                    if (!deletedShipping) {
                        throw new Error("Shipping not found");
                    }
                    callback(null, { success: true });
                } catch (error) {
                    console.error("Error deleting shipping (SOAP):", error);
                    callback({ SoapFault: { faultcode: "Server", faultstring: error.message } });
                }
            },
        },
    },
};

module.exports = ShippingSoapService;
