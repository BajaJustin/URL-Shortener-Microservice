require('dotenv').config({ path: 'sample.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const validUrl = require('valid-url');
const shortid = require('shortid');
const app = express();


/**************************  Mongodb  ***************************/
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: {type: String, required: true},
  short_url: {type: String, required: true}
});

const URL = mongoose.model("URL", urlSchema);
/*****************************************************************/

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Redirect user to their desired shortened url
app.get("/api/shorturl/:shorturl", async (req, res) => {
  // User entered shortened url
  const shorturl = req.params.shorturl;
  try {
    // Find one match, to users input
    let test = await URL.findOne({ short_url: shorturl});

    if(test){
      // Match found, reirect to user entered url page
      res.redirect(test.original_url);
    }else {
      // No match found, return error message
      res.json({
        error: "No short URL found for the given input"
      })
    }
  }catch(err){
    console.error(err);
  }
});

// Creating a new shortened url link API endpoint
app.post('/api/shorturl/new', async function(req, res) {
  // User entered url
  const url = req.body.url;
  // Generate a unique id
  const shortCode = shortid.generate();

  // Check if the url is valid or not
  if(!validUrl.isWebUri(url)){
    res.json({
      error: 'invalid url'
    });
  }else {
    try {
      let findUrl = await URL.findOne({ original_url: url });

      // Url entered is in the db, display it
      if(findUrl){
        // Display Json data
        res.json({
          original_url: findUrl.original_url,
          short_url: findUrl.short_url
        });
      }else {
        // Url is not in the db
        findUrl = await new URL({
          original_url: url,
          short_url: shortCode
        });
        // Save it in the db
        await findUrl.save();
        // Display json data
        res.json({
          original_url: findUrl.original_url,
          short_url: findUrl.short_url
        });
      }
    }catch(err){
      console.error(err);
    }
  }

});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
