// models/Job.js
import { DataTypes } from "sequelize";

export default function createJob(sequelize) {
  const Job = sequelize.define(
    "Job",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(160),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      budget: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("open", "assigned", "completed"),
        defaultValue: "open",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "jobs",
      timestamps: true,
      indexes: [{ fields: ["userId"] }, { fields: ["status"] }],
    }
  );

  return Job;
}