const { Topic, Post } = require('../models/index')

const createTopic = async (req, res, next) => {
    try {
        const { title, description } = req.body

        if (!title) {
            return res.status(400).json({
                EM: 'Vui lòng nhập tên topic',
                EC: 1,

            })
        }

        const topic = await Topic.create({ title, description })
        return res.status(201).json({
            EM: 'Tạo topic thành công',
            EC: 0,
            DT: topic
        })

    } catch (error) {
        next(error)
    }
}

const getTopicsForPreviewSection = async (req, res, next) => {
    try {
        const topicIds = [1, 2, 3, 4]
        let topicAndPosts = []
        for (id of topicIds) {
            const topic = await Topic.findOne({
                where: { id },
                attributes: ['id', 'title', 'description'],
                include: [{
                    model: Post,
                    attributes: ['id', 'title', 'is_approved'],
                    where: { is_approved: true },
                    limit: 5,
                    order: [['createdAt', 'DESC']]
                }]
            })
            if (topic) {
                topicAndPosts.push(topic)
            }
        }
        return res.status(200).json({
            EM: 'Lấy topic cho homepage',
            EC: 0,
            DT: topicAndPosts
        })
    } catch (error) {
        next(error)
    }
}

const getTopicsList = async (req, res, next) => {
    try {
        const topics = await Topic.findAll()
        return res.status(200).json({
            EM: 'Lấy danh sách topic',
            EC: 0,
            DT: topics
        })
    } catch (error) {
        next(error)
    }
}

const updateTopic = async (req, res, next) => {
    try {
        const topicId = req.params.topicId
        const { title, description } = req.body

        const topic = await Topic.findByPk(topicId)
        if (!topic) {
            return res.status(404).json({
                EM: 'Topic không tồn tại',
                EC: 1
            })
        }

        await topic.update({ title, description })
        return res.status(200).json({
            EM: 'Cập nhật topic thành công',
            EC: 0,
            DT: topic
        })
    } catch (error) {
        next(error)
    }
}

const deleteTopic = async (req, res, next) => {
    try {
        const topicId = req.params.topicId
        const topic = await Topic.findByPk(topicId)
        if (!topic) {
            return res.status(404).json({
                EM: 'Topic không tồn tại',
                EC: 1
            })
        }
        await topic.destroy()
        return res.status(200).json({
            EM: 'Xóa topic thành cong',
            EC: 0
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createTopic,
    getTopicsForPreviewSection,
    getTopicsList,
    updateTopic,
    deleteTopic
}
