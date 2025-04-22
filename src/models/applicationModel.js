const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define(
    'Application',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      owner: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date_applied: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      conversion_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      c_permit_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      c_permit_type: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      owner_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      application_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      overall_status: {
        type: DataTypes.ENUM('Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'),
        defaultValue: 'Draft',
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
      tableName: 'oscp_applications',
      timestamps: true,
      paranoid: true,
      underscored: true,
      hooks: {
        beforeCreate: async (application, options) => {
          const transaction = options.transaction || await sequelize.transaction();
          try {
            // Fetch at least 5 users with role: signatory
            const signatoryUsers = await sequelize.models.User.findAll({
              where: { role: 'signatory' },
              limit: 5,
              order: sequelize.random(), // Randomize for load distribution
              transaction,
            });

            if (signatoryUsers.length < 5) {
              throw new Error('Insufficient users with role: signatory. At least 5 required.');
            }

            // Create five signatory records
            const signatoryTypes = [
              'line_and_grade',
              'structural',
              'architectural',
              'electrical',
              'sanitary',
            ];
            const signatories = signatoryTypes.map((type, index) => ({
              application_id: application.id,
              user_id: signatoryUsers[index].id,
              signatory_type: type,
              status: 'Pending',
              remarks: '',
            }));

            await sequelize.models.Signatory.bulkCreate(signatories, { transaction });

            if (!options.transaction) await transaction.commit();
          } catch (error) {
            if (!options.transaction) await transaction.rollback();
            throw error;
          }
        },
      },
    }
  );

  return Application;
};