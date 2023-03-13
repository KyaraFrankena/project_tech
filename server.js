// const
const express = require ('express');
const app = express();
const path = require("path");
const { engine } = require('express-handlebars');
const PORT = process.env.PORT || 1337; 

require('dotenv').config({ path: '.env'});

// app.use
app.use('/', express.static('static'));
app.engine('.hbs', engine({extname: '.hbs'}));
app.set("view engine", '.hbs');
app.set("views", "./views");
app.use(express.urlencoded({ extended: true }));


// installatie mongodb (backend)
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require('mongodb');
const uri = process.env.DB_CONNECTION_STRING;
const client = new MongoClient (
    uri,
    {useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1}
)

client.connect()
.then((res) => console.log ('@@-- connection established'))
.catch((err) => console.log ('@@-- error', err))

app.get('/', (req,res) => {
    res.render('index.hbs');
});

app.get('/overzicht', async (req, res) => {
    // logic db call -> template aanroepen -> de data meegeven aan de template ||
    const collection = client.db ('MaeveInterior').collection('interior');
    const interiorList = await collection.find ({}).toArray();
    
    res.render("overzicht.hbs",  {interiorList});
})


app.get('/interieurinfo', (req, res) => {
    res.render("interieurinfo.hbs");
})

app.get('/likepagina', (req, res) => {
    res.render("likepagina.hbs", {

    });
})


app.post('/likepagina', async (req, res) => {  
    console.log('@@-- REQ. body', req.body);
    try {
        //like in de database opslaan
        const collection = client.db ('MaeveInterior').collection('interior');
        const filter = {_id: ObjectId(req.body.item-id)}
        const updateDoc = { 
            $set: {
                liked: "false"
            },
        } 
        const result = await collection.updateOne(filter, updateDoc);

        // haal lijst voor overzicht uit db en toon
        const interiorList = await collection.find ({}).toArray();
        res.render("overzicht.hbs",  {interiorList});
        } 
    catch (e) {
        console.log(e)
    }
    // saveLikeTDatabase(req.body.id)
    // like-item eventueel vervangen door likepagina
})

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})