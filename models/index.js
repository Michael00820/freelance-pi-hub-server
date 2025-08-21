// models/index.js
import sequelize from "../db.js";
import createUser from "./User.js";
import createPayment from "./Payment.js";

const User = createUser(sequelize);
const Payment = createPayment(sequelize);

// (add associations later if you need)
export { sequelize, User, Payment };
