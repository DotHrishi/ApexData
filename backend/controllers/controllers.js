import { NewsCache, CarDataCache, SessionsCache } from '../models/Cache.js';

export async function getNews(req, res) {
  try {
    const queryKey = "f1_news_latest"; // Constant key for the main news feed
    const cachedNews = await NewsCache.findOne({ query: queryKey });

    if (cachedNews) {
      console.log("Serving news from cache");
      return res.json(cachedNews.data);
    }

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

    // Store in cache
    await NewsCache.create({ query: queryKey, data: filteredNews });

    res.json(filteredNews);

  } catch (error) {
    res.status(500).json({ message: "Error fetching news", error: error.message });
  }
}

export async function carData(req, res) {
  try {
    const { driver_number = 55, session_key = 9159 } = req.query;
    const cacheKey = `${driver_number}:${session_key}`;

    const cachedCarData = await CarDataCache.findOne({ key: cacheKey });
    if (cachedCarData) {
      console.log("Serving car data from cache");
      return res.json(cachedCarData.data);
    }

    const url = `https://api.openf1.org/v1/car_data?driver_number=${driver_number}&session_key=${session_key}&speed>=315`;

    const response = await fetch(url);
    const data = await response.json();

    // Store in cache
    await CarDataCache.create({ key: cacheKey, data: data });

    return res.json(data);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching data",
      error: error.message
    });
  }
}

export async function getSessions(req, res) {
  try {
    const queryKey = "all_sessions";

    const cachedSessions = await SessionsCache.findOne({ query: queryKey });
    if (cachedSessions) {
      console.log("Serving sessions from cache");
      return res.json(cachedSessions.data);
    }

    const response = await fetch('https://api.openf1.org/v1/sessions');
    const data = await response.json();

    // Store in cache
    await SessionsCache.create({ query: queryKey, data: data });

    return res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sessions", error: error.message });
  }
}
