require("dotenv").config();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use(async (req, res, next) => {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          new Buffer.from(client_id + ":" + client_secret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      req.access_token = data.access_token;
      next();
    } else {
      res.status(response.status).json(response.message);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch access token" });
  }
});

// async function getAccessToken() {
//   const response = await fetch('https://accounts.spotify.com/api/token', {
//     method: 'POST',
//     body: new URLSearchParams({
//       'grant_type': 'client_credentials',
//     }),
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
//     },
//   });

//   const data = await response.json()
//   return data.access_token;
// }

app.get("/search-albums", async (req, res) => {
  try {
    console.log(req.query.input);
    const query = req.query.input;
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=album&market=US`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + req.access_token,
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: response.message });
    }

    const data = await response.json();
    res.status(200).json(data.albums.items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch albums" });
  }
});

app.get("/fetch-album/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const response = await fetch(
      `https://api.spotify.com/v1/albums/${id}?market=US`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + req.access_token,
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: response.message });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch album" });
  }
});

const port = 3001;

app.listen(port, () => {
  console.log(`Spotify project running on http://localhost:${port}`);
});
