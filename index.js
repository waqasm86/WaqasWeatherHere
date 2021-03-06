const express = require('express');
const Datastore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config();
console.log(process.env);
const port = process.env.PORT || 3000;

const api_key = process.env.API_KEY;

const app = express();
app.listen(port, () => console.log(`listening at ${port}`));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

const database = new Datastore('database.db');
database.loadDatabase();

app.get('/api', (request, response) => {
  database.find({}, (err, data) => {
    if (err) {
      response.end();
      return;
    }
    response.json(data);
  });
});

app.post('/api', (request, response) => {
  const data = request.body;
  const timestamp = Date.now();
  data.timestamp = timestamp;
  database.insert(data);
  response.json(data);
});

app.get('/weather/:latlon', async (request, response) => {
  console.log(request.params);
  const latlon = request.params.latlon.split(',');
  console.log(latlon);
  const lat = latlon[0];
  const lon = latlon[1];
  console.log(lat+' '+lon);
  //const api_url = `https://api.climacell.co/v3/weather/forecast/daily?lat=${lat}&lon=${lon}&unit_system="si"&start_time="now"&fields="temp"&apikey=${api_key}`;
  const weather_url = `https://api.climacell.co/v3/weather/realtime?lat=${lat}&unit_system=si&lon=${lon}&fields=temp,weather_code&apikey=${api_key}`;
  const weather_response = await fetch(weather_url);
  const weather_data = await weather_response.json();

  const aq_url = `https://api.openaq.org/v1/latest?coordinates=${lat},${lon}`;
  const aq_response = await fetch(aq_url);
  const aq_data = await aq_response.json();

  const data = {
    weather: weather_data,
    air_quality: aq_data
  }
  response.json(data);
});

/*
const weather_url = `https://api.climacell.co/v3/weather/realtime?lat=${latitude}&lon=${longitude}&fields%5B%5D=temp&fields%5B%5D=weather_code&fields%5B%5D=feels_like&fields%5B%5D=precipitation_type&apikey=${api_key}`

const airQuality_url = `https://api.openaq.org/v1/latest?coordinates=${latitude},${longitude}`
*/