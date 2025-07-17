const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { Order, Product } = require("../models/index");

const createCheckoutSession = async (req, res) => {
    const { product, orderId } = req.body;
    const userId = req?.user?.userId;
    if (!product || !orderId) {
        return res.status(400).json({
            error: "Thiếu thông tin đơn hàng, vui lòng bổ sung"
        });
    }
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: product.title,
                        },
                        unit_amount: Math.round(Number(product.price) * 100), // quy đổi sang cents và phải là INT
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.CLIENT_DOMAIN}/payment-success?session_id={CHECKOUT_SESSION_ID}&product_id=${product.id}`,
            cancel_url: `${process.env.CLIENT_DOMAIN}/payment-cancel`,
            metadata: {
                product_id: product.id,
                order_id: orderId,
                user_id: userId
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Lỗi tạo session:", error.message);
        res.status(500).json({ error: "Không tạo được phiên thanh toán" });
    }
};


const verifyCheckoutSession = async (req, res) => {
    const { session_id } = req.query;

    if (!session_id) {
        return res.status(400).json({ error: "Thiếu session_id" });
    }

    try {
        // Gọi Stripe để lấy session
        const session = await stripe.checkout.sessions.retrieve(session_id);

        // Kiểm tra trạng thái thanh toán
        if (session.payment_status === "paid") {
            const orderId = session.metadata.order_id;
            const productId = session.metadata.product_id;

            const order = await Order.findOne({ where: { id: orderId } });

            // Kiểm tra tránh bug
            if (!order) {
                return res.status(404).json({ EC: 1, EM: "Không tìm thấy đơn hàng" });
            }

            if (order.payment_status === 'PAID') {
                return res.status(200).json({ EC: 0, EM: "Đơn hàng đã xử lý trước đó" });
            }

            // Cập nhật đơn hàng trong DB
            await Order.update(
                {
                    payment_status: "PAID",
                    transaction_code: session.id
                },
                {
                    where: { id: orderId }
                }
            );

            // tăng views lên khi thanh toán thành công
            await Product.increment("views", {
                by: 1,
                where: { id: productId }
            });
            console.log("✅ [verifyCheckoutSession] Gọi verify với session_id:", session_id);

            return res.status(200).json({ EC: 0, EM: "Xác thực thanh toán thành công" });
        } else {
            return res.status(400).json({ EC: 1, EM: "Thanh toán chưa hoàn tất" });
        }
    } catch (error) {
        console.error("Lỗi xác thực session:", error.message);
        return res.status(500).json({ error: "Không xác thực được phiên thanh toán" });
    }
};
module.exports = { createCheckoutSession, verifyCheckoutSession };