'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("Orders", "vnpay_txn_code", "transaction_code");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn("Orders", "transaction_code", "vnpay_txn_code");
  }
};
