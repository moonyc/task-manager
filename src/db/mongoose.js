const mongoose = require('mongoose')

//mongoose uses mongodb package behind the sceene. in connect we need to provide with a parseobject option and a url

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
})



/*const sasha = new User ({
    name: "Sasha",
    email: 'Sasha@gmail.com',
    password: 'password123'
    
})

sasha.save().then((sasha) => {
    console.log('fru', sasha)
}).catch((error) =>{
        console.log('Oh, no!', error)
    })

*/
/*
    
    
    const miao = new Task({
        description: "Second thing in the morning"
    })

    miao.save().then((miao)=>{
        console.log(miao)
    }).catch((error) =>{
        console.log(error)
    })

    /*const fru = new Task({
        description: 'First thing in the morning',
        completed: true
    })

    fru.save().then((fru)=>{
        console.log('fru', fru)
    }).catch((error) =>{
        console.log('oh no', error)
    })*/
