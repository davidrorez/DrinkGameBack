const express = require('express');
const app = express();
const PORT = 4000;
const cors = require('cors');
require('dotenv').config();

app.use(express.json());
app.use(cors({
	origin: '*',
	methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));

const userRoutes = require('./routes/userRoutes');
const challengeRoutes = require('./routes/challengeRoutes');

app.use('/user', userRoutes);
app.use('/challenge', challengeRoutes);
app.get('/', (req, res) => {
	res.send('Hola capos!')
})

app.get('*', (req, res) => {
  res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
	console.log(`PORT ON: ${PORT}`);
});
