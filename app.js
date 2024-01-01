const express=require('express');
const bodyParser=require('body-parser');
const cors=require('cors');
require('dotenv').config();
const app=express();

const sequelize=require('./util/database')
const userRoute=require('./routers/userRoute')

app.use(bodyParser.json());
app.use(cors());
app.use(express.static( "public"));

app.use('/user',userRoute)


// Sync models with the database
sequelize.sync({alter:true}).then(() => {
    console.log('Server started on port 4000');
    app.listen(4000);
}).catch(err => {
    console.error('Error syncing with database:', err);
});