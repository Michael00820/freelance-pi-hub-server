// models/User.js
import { DataTypes } from "sequelize";

export default function createUser(sequelize) {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(160),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      passwordHash: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("freelancer", "client"),
        allowNull: false,
        defaultValue: "freelancer",
      },
    },
    {
      tableName: "users",
      timestamps: true,
      indexes: [{ unique: true, fields: ["email"] }],
    }
  );

  return User;
}