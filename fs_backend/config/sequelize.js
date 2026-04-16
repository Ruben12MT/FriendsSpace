const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE || process.env.DB_NAME,
  process.env.MYSQLUSER     || process.env.DB_USER,
  process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
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