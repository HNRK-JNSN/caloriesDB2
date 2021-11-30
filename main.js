const { Client } = require("pg");
const express = require('express')

const app = express()
const api_port = 3000

const PORT = process.env.PORT || 8080;
const DB_USER = process.env.DB_USER || "<my_user>";
const DB_HOST = process.env.DB_HOST || "<my_host>";
const DB_NAME = process.env.DB_NAME || "<my_db>";
const DB_PW = process.env.DB_PW || "<my_passwd>";
const DB_PORT = process.env.DB_PORT || 5432;

if (!process.env.DB_NAME || !process.env.DB_PW) {
  console.warn("Husk at sætte databasenavn, password og user via env vars.");
  console.warn("Sæt fx databasenavn sådan her (i bash):", `export DB_NAME="databasenavn"`);
  console.warn("Lige nu er databasenavn sat til:", DB_NAME);
} else {
  console.log("Postgres database:", DB_NAME);
  console.log("Postgres user:", DB_USER);
}

const qry = `SELECT * FROM food`
const klient = new Client({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PW,
  port: DB_PORT
});

app.get('/food', async (req, res) => {
    try {
        let queryData = await klient.query(qry);
        res.json({
          "ok": true,
          "foods": queryData.rows,
        })
      } catch (error) {
        res.json({
          "ok": false,
          "message": error.message,
        })
      }
})

app.get('/food/:category', async (req, res) => {

  console.log(req.params)

  let cqry = `SELECT f.food_item FROM food f ` +
             ` JOIN food_category fc USING (category_id) ` +
             ` WHERE fc.category = '${req.params['category']}'`

  try {
      let queryData = await klient.query(cqry);
      res.json({
        "ok": true,
        "foods": queryData.rows,
      })
    } catch (error) {
      res.json({
        "ok": false,
        "message": error.message,
      })
    }
})

// Programmet starter her:
klient.connect();

app.use(express.static('public'))

app.listen(api_port, () => {
    console.log(`Calories lytter på http://localhost:${api_port}`)
})
