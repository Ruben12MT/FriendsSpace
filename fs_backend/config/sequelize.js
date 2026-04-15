const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'production' ? false : false,
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión exitosa a la base de datos MySQL');
  } catch (error) {
    console.error('Error de conexión:', error);
  }
})();

module.exports = sequelize;
