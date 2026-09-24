const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ES_HOST = process.env.ES_HOST || "http://elasticsearch:9200";

app.use(express.static(path.join(__dirname, "frontend")));

app.get("/api/search", async (req, res) => {
  const q = req.query.q || "";
  const body = {
    size: 20,
    query: q
      ? {
          multi_match: {
            query: q,
            fields: ["title^2", "overview", "genres"]
          }
        }
      : { match_all: {} }
  };

  try {
    const r = await fetch(`${ES_HOST}/elastiflix-movies/_search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    const hits = (data.hits?.hits || []).map((h) => ({
      id: h._id,
      title: h._source.title,
      overview: h._source.overview,
      genres: h._source.genres,
      release_date: h._source.release_date,
      vote_average: h._source.vote_average,
      poster_path: h._source.poster_path
    }));
    res.json({ count: data.hits?.total?.value ?? hits.length, results: hits });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "search failed" });
  }
});

app.listen(PORT, () => console.log(`Elastiflix-simple running on :${PORT}`));
