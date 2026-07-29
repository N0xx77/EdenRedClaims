
const sequelize = require('./database');

const User = require('../models/user');
const Status = require('../models/status');
const Category = require('../models/category');
const Claims = require('../models/claims');
const Receipt = require('../models/receipt');
const Item = require('../models/items');
const Company = require('../models/company');
const { FORCE } = require('sequelize/lib/index-hints');

User.hasMany(Claims, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Claims.belongsTo(User, { foreignKey: 'user_id' });
Status.hasMany(Claims, { foreignKey: 'status_id', onDelete: 'CASCADE' });
Claims.belongsTo(Status, { foreignKey: 'status_id' });
Category.hasMany(Claims, { foreignKey: 'category_id', onDelete: 'CASCADE' })
Claims.belongsTo(Category, { foreignKey: 'category_id' })

Receipt.hasOne(Claims, { foreignKey: 'claim_id', onDelete: 'CASCADE' })
Claims.belongsTo(Receipt, { foreignKey: 'claim_id' })

Company.hasMany(User, { foreignKey: 'company_id', onDelete: 'CASCADE', });
User.belongsTo(Company, { foreignKey: 'company_id', });
Company.hasMany(Claims, { foreignKey: 'company_id', onDelete: 'CASCADE', });
Claims.belongsTo(Company, { foreignKey: 'company_id', });


sequelize.sync({ alter: true }).then(async () => {
    console.log('Database connected and synchronised...');

    const statuses = [
        { id: 1, status_name: 'Pending' },
        { id: 2, status_name: 'Approved' },
        { id: 3, status_name: 'Denied' },
        { id: 4, status_name: 'Partially Approved' }
    ];
    for (const s of statuses) {
        await Status.findOrCreate({
            where: { status_name: s.status_name },
            defaults: { id: s.id, status_name: s.status_name }
        });
    }

    const categories = [
        { id: 1, category_name: 'Travel' },
        { id: 2, category_name: 'Food' },
        { id: 3, category_name: 'Medical' }
    ];
    for (const c of categories) {
        await Category.findOrCreate({
            where: { category_name: c.category_name },
            defaults: { id: c.id, category_name: c.category_name }
        });
    }

    const companies = [
        { id: 1, company_name: 'Amazon' },
        { id: 2, company_name: 'DallasTech' }
    ];

    for (const c of companies) {
        await Company.findOrCreate({
            where: { company_name: c.company_name },
            defaults: {
                id: c.id,
                company_name: c.company_name
            }
        });
    } 
}).catch(err => {
    console.error('Database sync error:', err);
});

