require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const e = require('express');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// array on websites
var sites = [];

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// New url endpoint
app.get('/api/shorturl/:shorturl', (req, res) => {
  var shorturl = req.params.shorturl;

  // Check if user entered a valid shorthand url
  if(!shorturl || sites.indexOf(sites[shorturl]) === -1){
    res.json({
      error: 'No short URL found for the given input'
    });
  }else if(isNaN(parseInt(shorturl))) {
    res.json({
      error: 'Wrong format'
    });
  }else {
    res.redirect(sites[shorturl]);
  }
})

// Creating new shorthand url endpoint
app.post('/api/shorturl/new', function(req, res) {
  var url;
  // Validate url input
  try{
    url = new URL(req.body.url);

    // If website isn't in the array, add it
    if(!sites.includes(url.href)){
      sites.push(url.href);
    }
    
    res.json({
      original_url: url,
      short_url: sites.indexOf(url.href)
    })
  }catch(_){
    res.json({
      error: 'Invalid url'
    })
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
