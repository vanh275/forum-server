const { Order, Product } = require("../models/index");

const createOrder = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const userId = req?.user?.userId

        const product = await Product.findByPk(productId)
        if (!product) {
            return res.status(404).json({
                EM: "Sản phẩm không tồn tại",
                EC: 1
            })
        }

        if (!userId) {
            return res.status(401).json({
                EM: "Vui lớng đăng nhập",
                EC: 1
            })
        }

        const order = await Order.create({
            product_id: productId,
            user_id: userId,
            total_price: product.price,
            vnpay_txn_code: null,
            payment_status: 'PENDING'
        })
        return res.status(201).json({
            EM: "Tạo đơn hàng thành công",
            EC: 0,
            DT: order
        })

    } catch (error) {
        next(error)
    }
}

const checkIfPurchased = async (req, res, next) => {
    try {
        const userId = req?.user?.userId;
        const { productId } = req.params

        console.log(userId, productId)

        const order = await Order.findOne({
            where: {
                product_id: productId,
                user_id: userId,
                payment_status: "PAID"
            }
        });

        if (order) {
            return res.status(200).json({ EC: 0, EM: "Đã mua" });
        } else {
            return res.status(200).json({ EC: 1, EM: "Chưa mua" });
        }
    } catch (error) {
        next(error);
    }
};

const getMyOrder = async (req, res, next) => {
    try {
        const userId = req.user.userId
        const orders = await Order.findAll({
            where: { user_id: userId, payment_status: "PAID" },
            include: [
                {
                    model: Product,
                    attributes: ['title', 'price']
                }
            ],
            order: [['createdAt', 'DESC']]
        })
        return res.status(200).json({ EC: 0, EM: "Lấy lịch sử mua hàng", DT: orders })
    } catch (error) {
        next(error)
    }
}

module.exports = { createOrder, checkIfPurchased, getMyOrder }