const mongoose = require("mongoose");
const Order = require("./models/order.model");

const OrdersSoapService = {
    OrdersService: {
        OrdersServicePort: {
            createOrder: async (args, callback) => {
                try {
                    const { userId, productId, amount, quantity } = args.order;
                    const newOrder = new Order({ userId, productId, amount, quantity, status: "pending" });
                    await newOrder.save();
                    callback(null, { order: newOrder.toObject() });
                } catch (error) {
                    console.error("Error creating order (SOAP):", error);
                    callback({ SoapFault: { faultcode: "Server", faultstring: error.message } });
                }
            },

            getOrderById: async (args, callback) => {
                try {
                    if (!mongoose.Types.ObjectId.isValid(args.orderId)) {
                        throw new Error("Invalid Order ID");
                    }
                    const order = await Order.findById(args.orderId);
                    if (!order) {
                        throw new Error("Order not found");
                    }
                    callback(null, { order: order.toObject() });
                } catch (error) {
                    console.error("Error getting order by ID (SOAP):", error);
                    callback({ SoapFault: { faultcode: "Server", faultstring: error.message } });
                }
            },

            getAllOrders: async (args, callback) => {
                try {
                    const orders = await Order.find({});
                    callback(null, { order: orders.map(o => o.toObject()) });
                } catch (error) {
                    console.error("Error getting all orders (SOAP):", error);
                    callback({ SoapFault: { faultcode: "Server", faultstring: error.message } });
                }
            },

            updateOrderStatus: async (args, callback) => {
                try {
                    if (!mongoose.Types.ObjectId.isValid(args.orderId)) {
                        throw new Error("Invalid Order ID");
                    }
                    const updatedOrder = await Order.findByIdAndUpdate(
                        args.orderId,
                        { status: args.status },
                        { new: true }
                    );
                    if (!updatedOrder) {
                        throw new Error("Order not found");
                    }
                    callback(null, { order: updatedOrder.toObject() });
                } catch (error) {
                    console.error("Error updating order status (SOAP):", error);
                    callback({ SoapFault: { faultcode: "Server", faultstring: error.message } });
                }
            },

            deleteOrder: async (args, callback) => {
                try {
                    if (!mongoose.Types.ObjectId.isValid(args.orderId)) {
                        throw new Error("Invalid Order ID");
                    }
                    const deletedOrder = await Order.findByIdAndDelete(args.orderId);
                    if (!deletedOrder) {
                        throw new Error("Order not found");
                    }
                    callback(null, { success: true });
                } catch (error) {
                    console.error("Error deleting order (SOAP):", error);
                    callback({ SoapFault: { faultcode: "Server", faultstring: error.message } });
                }
            },
        },
    },
};

module.exports = OrdersSoapService;
