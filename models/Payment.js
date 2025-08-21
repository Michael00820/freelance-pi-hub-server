// models/Payment.js
import { DataTypes } from "sequelize";

export default function createPayment(sequelize) {
  const Payment = sequelize.define(
    "Payment",
    {
      id: { type: DataTypes.STRING, primaryKey: true }, // Pi paymentId
      uid: { type: DataTypes.STRING, allowNull: false }, // Pi user uid
      amount: { type: DataTypes.DECIMAL(18, 8), allowNull: false },
      memo: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING, defaultValue: "pending" }, // pending/approved/completed
      txid: { type: DataTypes.STRING }
    },
    { tableName: "payments", timestamps: true }
  );
  return Payment;
}
