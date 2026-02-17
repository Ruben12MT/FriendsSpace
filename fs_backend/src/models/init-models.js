var DataTypes = require("sequelize").DataTypes;
var _ad = require("./ad");
var _ad_interest = require("./ad_interest");
var _connection = require("./connection");
var _interest = require("./interest");
var _message = require("./message");
var _request = require("./request");
var _user = require("./user");
var _user_connection = require("./user_connection");
var _user_interest = require("./user_interest");

function initModels(sequelize) {
  var ad = _ad(sequelize, DataTypes);
  var ad_interest = _ad_interest(sequelize, DataTypes);
  var connection = _connection(sequelize, DataTypes);
  var interest = _interest(sequelize, DataTypes);
  var message = _message(sequelize, DataTypes);
  var request = _request(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);
  var user_connection = _user_connection(sequelize, DataTypes);
  var user_interest = _user_interest(sequelize, DataTypes);

  ad.belongsToMany(interest, { as: 'interest_id_interests', through: ad_interest, foreignKey: "ad_id", otherKey: "interest_id" });
  connection.belongsToMany(user, { as: 'user_id_users', through: user_connection, foreignKey: "connection_id", otherKey: "user_id" });
  interest.belongsToMany(ad, { as: 'ad_id_ads', through: ad_interest, foreignKey: "interest_id", otherKey: "ad_id" });
  interest.belongsToMany(user, { as: 'user_id_user_user_interests', through: user_interest, foreignKey: "interest_id", otherKey: "user_id" });
  user.belongsToMany(connection, { as: 'connection_id_connections', through: user_connection, foreignKey: "user_id", otherKey: "connection_id" });
  user.belongsToMany(interest, { as: 'interest_id_interest_user_interests', through: user_interest, foreignKey: "user_id", otherKey: "interest_id" });
  ad_interest.belongsTo(ad, { as: "ad", foreignKey: "ad_id"});
  ad.hasMany(ad_interest, { as: "ad_interests", foreignKey: "ad_id"});
  message.belongsTo(connection, { as: "connection", foreignKey: "connection_id"});
  connection.hasMany(message, { as: "messages", foreignKey: "connection_id"});
  user_connection.belongsTo(connection, { as: "connection", foreignKey: "connection_id"});
  connection.hasMany(user_connection, { as: "user_connections", foreignKey: "connection_id"});
  ad_interest.belongsTo(interest, { as: "interest", foreignKey: "interest_id"});
  interest.hasMany(ad_interest, { as: "ad_interests", foreignKey: "interest_id"});
  user_interest.belongsTo(interest, { as: "interest", foreignKey: "interest_id"});
  interest.hasMany(user_interest, { as: "user_interests", foreignKey: "interest_id"});
  message.belongsTo(message, { as: "reply", foreignKey: "reply_id"});
  message.hasMany(message, { as: "messages", foreignKey: "reply_id"});
  ad.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(ad, { as: "ads", foreignKey: "user_id"});
  message.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(message, { as: "messages", foreignKey: "user_id"});
  request.belongsTo(user, { as: "sender", foreignKey: "sender_id"});
  user.hasMany(request, { as: "requests", foreignKey: "sender_id"});
  request.belongsTo(user, { as: "receiver", foreignKey: "receiver_id"});
  user.hasMany(request, { as: "receiver_requests", foreignKey: "receiver_id"});
  user_connection.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(user_connection, { as: "user_connections", foreignKey: "user_id"});
  user_connection.belongsTo(user, { as: "blocked_by_user", foreignKey: "blocked_by"});
  user.hasMany(user_connection, { as: "blocked_by_user_connections", foreignKey: "blocked_by"});
  user_interest.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(user_interest, { as: "user_interests", foreignKey: "user_id"});

  return {
    ad,
    ad_interest,
    connection,
    interest,
    message,
    request,
    user,
    user_connection,
    user_interest,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
