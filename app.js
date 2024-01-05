const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const app = express();

const sequelize = require('./util/database');
const userRoute = require('./routers/userRoute');
const chatRoute = require('./routers/chatRouter');

const User = require('./model/user');
const Message = require('./model/messages');
const Contact = require('./model/contactModel');

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

app.use('/user', userRoute);
app.use('/chat',chatRoute);
Contact.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Contact.belongsTo(User, { as: 'contact', foreignKey: 'contactId' });

Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'user', foreignKey: 'receiverId' });

// Sync models with the database
sequelize.sync().then(() => {
    console.log('Server started on port 4000');
    app.listen(4000);
}).catch(err => {
    console.error('Error syncing with database:', err);
});
