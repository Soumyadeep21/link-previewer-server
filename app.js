import dotenv from "dotenv";
dotenv.config();
import http from "http";
import cors from "cors";
import express from "express";
const app = express();

import cheerio from "cheerio";
import fetch from "node-fetch";
import getUrls from "get-urls";

const PORT = process.env.PORT || 8080;
app.set("port", PORT);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const scrapeMetatags = async (text) => {
  return Promise.all(requests);
};

app.post("/scraper", async (req, res) => {
  const { text } = req.body;
  // const data = await scrapeMetatags(text);
  const urls = Array.from(getUrls(text));
  if (urls.length == 0) {
    return res.status(400).json({
      error: "No Url found",
    });
  }
  const url = urls[0];
  try {
    const resp = await fetch(url);

    const html = await resp.text();
    const $ = cheerio.load(html);

    const getMetatag = (name) =>
      $(`meta[name=${name}]`).attr("content") ||
      $(`meta[property="og:${name}"]`).attr("content") ||
      $(`meta[property="twitter:${name}"]`).attr("content");

    const data = {
      url,
      title: $("title").first().text(),
      favicon: $('link[rel="icon"]').attr("href"),
      // description: $('meta[name=description]').attr('content'),
      description: getMetatag("description"),
      image: getMetatag("image"),
      author: getMetatag("author"),
    };
    if (data.favicon != undefined && data.favicon.startsWith("/")) {
      data.favicon = data.url + data.favicon
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      error: "Some error occurred!",
    });
  }
});

const server = http.createServer(app);
server.listen(PORT);
server.on("listening", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
