// models/User.js
import { DataTypes } from "sequelize";

export default function createUser(sequelize) {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      uid: { // Pi user uid
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM("freelancer", "client"),
        defaultValue: "freelancer"
      }
    },
    { tableName: "users", timestamps: true }
  );

  return User;
}
