const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Signatory = sequelize.define(
    'Signatory',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false, // User is now required
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      application_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'oscp_applications',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      signatory_type: {
        type: DataTypes.ENUM('line_and_grade', 'structural', 'architectural', 'electrical', 'sanitary'),
        allowNull: false,
      },
      sign_date: {
        type: DataTypes.DATE,
        allowNull: true, // Set when approved
      },
      remarks: {
        type: DataTypes.TEXT,
        defaultValue: '',
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending',
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'signatories',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );

  return Signatory;
};