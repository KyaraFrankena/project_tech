// const
const express = require ('express');
const app = express();
const path = require("path");
const { engine } = require('express-handlebars');
const PORT = process.env.PORT || 3000; 

require('dotenv').config({ path: '.env'});

// app.use
app.use('/', express.static('static'));
app.engine('.hbs', engine({extname: '.hbs'}));
app.set("view engine", '.hbs');
app.set("views", "./views");
app.use(express.urlencoded({ extended: true }));


// installatie mongodb (backend) (source: Janno voor code over installatie MongoDB)
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


// app.get voor index, instellingen voor api.
app.get('/', (req,res) => {
    let quote;
    let options = {
      method: 'GET',
      headers: { 'x-api-key': process.env.API_KEY }
    }
    let url = 'https://api.api-ninjas.com/v1/quotes?category=home'
    
    fetch(url, options) // fetch is async but api is await,(source: Ivo Nijhuis)
            .then(res => res.json()) // parse response as JSON
            .then(data => {
              quote = data;
              console.log(quote);
              res.render('index.hbs', {title: 'MaeveInterior - Home', quote: quote[0].quote, author: quote[0].author}); 
            })
            .catch(err => {
                console.log(`error ${err}`)
      }); 
  })
  

// app.get voor overzicht, halen van info uit database, hulp van sonja
app.get('/overzicht', async (req, res) => {
    // logic db call -> template aanroepen -> de data meegeven aan de template ||
    const collection = client.db ('MaeveInterior').collection('interior');
    const interiorList = await collection.find ({}).toArray();

    res.render("overzicht.hbs",  {interiorList});
})

//(source: Philip hulp bij like true/false)
app.get('/likepagina', async (req, res) => {
    // haal alle gelikde beelden op uit db
    const collection = client.db ('MaeveInterior').collection('interior');
    const likedStyles = await collection.find({liked: true}).toArray();
    res.render('likepagina.hbs', {likedStyles});
    console.log(likedStyles)
})

//(source: Philip - studentassistent)
app.post('/likepagina',  async (req, res) => {  
    // console.log('@@-- REQ. body', req.body);

    console.log(JSON.parse(JSON.stringify(req.body)))

    try {
        // definieër collection en filter
        const collection = client.db ('MaeveInterior').collection('interior');
        const filter = {_id: new ObjectId(req.body.itemid)}

        // zoek inspiratie beeld uit db
        const inspiratieBeeld = await collection.findOne(filter);
        
        // wanneer inspiratie beeld geliked unlike anders like
        if (inspiratieBeeld.liked) {
            const result = await collection.updateOne(filter, {$set: {liked: false}});
        } else {
            const result = await collection.updateOne(filter, {$set: {liked: true}});
        }
        // redirect naar overzicht pagina
        res.redirect('/overzicht');
        }   
    catch (e) {
        console.log(e)
    }
});

//ID toevoegen bij click op interieurbeeld (route parameter)
app.get ('/interieurinfo/:id', async (req,res) => {
    try {
        console.log ('@@-test', req.params.id)
    //console.log('i run')

    //collectie ophalen uit database
    const informationCollection = client.db ('MaeveInterior').collection('interior');

    //zoeken database in combinatie met id
    const objectID = new ObjectId(req.params.id);

    // een id vinden uit de database
    const style = await informationCollection.findOne({_id: objectID});
    console.log(style);

    res.render('interieurinfo.hbs', {style});
    } catch (err) {
        console.log(err);
    }
})

// app.use voor 404 error state
app.use((req, res) => { // error handler, style in css
    res.status(404);
    res.render('404.hbs', {title: 'MaeveInterior - 404 page not found'});
  });

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})