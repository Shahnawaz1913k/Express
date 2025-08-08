const express = require('express');
const app = express();

app.get('/', (req, res) => {            
  res.send('Hello from Express!');
});

app.get('/user', (req, res) => {
    res.send('Getting all user')
});

app.post('/user', (req, res)=>{
    res.send('Creating a new user')
})

app.put('/user/:id', (req, res)=>{
    res.send(`Updating user with ID ${req.params.id}`)
});

app.delete('/user/:id', (req, res) =>{
    res.send(`Deleting uder with ID ${req.params.id}`)
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
