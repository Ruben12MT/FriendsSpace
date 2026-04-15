const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
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
