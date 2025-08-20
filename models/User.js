// models/User.js
import { DataTypes } from "sequelize";
import sequelize from "../db.js";

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
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    role: {
      type: DataTypes.ENUM("Freelancer", "Client"),
      allowNull: false,
      defaultValue: "Freelancer",
    },
    passwordHash: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    indexes: [{ unique: true, fields: ["email"] }],
  }
);

export default User;