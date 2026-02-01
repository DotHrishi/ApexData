export async function getNews ( req, res) {
    try{ 

    const response = await fetch(`https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_API_KEY}&q=formula1 OR F1 OR Formula1 OR F1 OR f1&language=en&category=sports&image=1`);
    const data = await response.json();
    const seen = new Set();

const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")   // remove punctuation
    .replace(/\s+/g, " ")          // normalize spaces
    .trim();

const filteredNews = (data.results || [])
  .filter(article => {
    if (!article.title) return false;

    // take first ~60 chars of normalized title as signature
    const key = normalize(article.title).slice(0, 60);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  })
  .map(article => ({
    headline: article.title,
    description: article.description,
    image: article.image_url,
    source: article.source_name,
    link: article.link,
  }));


    res.json(filteredNews);

    } catch (error) {
        res.status(500).json({message: "Error fetching news", error: error.message});
    }
}

export async function carData(req, res) {
  try {
    const url =
      "https://api.openf1.org/v1/car_data?driver_number=55&session_key=9159&speed%3E=315";

    const response = await fetch(url);
    const data = await response.json();

    return res.json(data);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching data",
      error: error.message
    });
  }
}
