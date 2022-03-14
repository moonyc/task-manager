const app = require('./app')


//enviroment variables
const port =process.env.PORT

app.listen(port, ()=> {
    console.log('server is up on port ' + port)
    
})




