const express = require('express');
const mysql = require('mysql2');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const http = require('http');
const coap = require('coap');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mqtts',
});

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/strategies', (req, res) => {
  pool.query('SELECT * FROM strategy', (error, results) => {
    if (error) {
      res.status(500).send('Error retrieving strategies from database');
    } else {
      res.send(results);
    }
  });
});

app.put('/setFlag', (req, res) => {
  const { strategy_id, flag } = req.body;
  pool.query(`UPDATE strategy SET flag = ${flag} WHERE strategy_id = ${strategy_id}`, (error, results) => {
    if (error) {
      res.status(500).send('Error updating flag in database');
    } else {
      res.send(results);
    }
  });
});

app.post('/addStrategies', (req, res) => {
  const { strategy_name, description, flag, created_at } = req.body;
  pool.query(`INSERT INTO strategy (strategy_name, description, flag, created_at) VALUES (?,?,?,?)`, [strategy_name, description, flag, created_at], (error, results) => {
    if (error) {
      res.status(500).send('Error adding data to database');
    } else {
      res.send(results);
    }
  });
});

app.delete('/delStrategies', (req, res) => {
  const { strategy_id } = req.body;
  pool.query(`DELETE FROM strategy WHERE strategy_id =?`, [strategy_id], (error, results) => {
    if (error) {
      res.status(500).send('Error deleting data from database');
    } else {
      res.send(results);
    }
  });
});

function turnOnBulb() {
  http.get('http://smartbulb.local/bulb/on', (res) => {
    console.log(`Bulb turned on. Status code: ${res.statusCode}`);
  }).on('error', (e) => {
    console.error(`Error turning on bulb: ${e.message}`);
  });
}
function turnOffBulb() {
  http.get('http://smartbulb.local/bulb/off', (res) => {
    console.log(`Bulb turned off. Status code: ${res.statusCode}`);
      }).on('error', (e) => {
    console.error(`Error turning off bulb: ${e.message}`);
  });
}
app.get('/turnOnBulbs', (req, res) => {
  if (!res.body) {
    turnOnBulb()
    res.send({
      message: 'Turn on the light bulb and call the node backend turnOnBulb function to turn on the light'
    });
  }
  else {
    res.send({
      message: 'Background Error'
    });
  }
});

app.get('/turnOffBulbs', (req, res) => {
  if (!res.body) {
    turnOffBulb()
    res.send({
      message: 'Turn off the light bulb and call the node backend turnOffBulb function to turn on the light'
    });
  }
  else {
    res.send({
      message: 'Background Error'
    });
  }
});

function getTemperature() {
  const request = coap.request('coap://sensornetwork.local/temperature');
  request.end();
  request.on('response', (res) => {
    const temperature = res.payload.toString();
    console.log(`Current temperature: ${temperature}`);
  });
}
app.get('/getTemperatures', (req, res) => {
  if (!res.body) {
    res.send({
      message: 'Use oAP protocol to simulate the transmission of sensor data',
      num:36
    });
  }
  else {
    res.send({
      message: 'Background Error'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

