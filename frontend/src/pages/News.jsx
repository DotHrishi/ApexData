import React, { use } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "../config/api";

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/news`)
      .then((res) => res.json())
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="p-5 m-5">
        <div className="orbitron text-4xl m-5">
          LATEST <span className="text-green-500">NEWS</span>
        </div>

        <div className="flex flex-col">
          {loading && (
            <p className="text-gray-400 animate-pulse justify-center w-full h-full">
              Loading News.....
            </p>
          )}

          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#000000] rounded-xl border border-green-500
             overflow-hidden shadow-lg hover:shadow-blue-600/20
             hover:-translate-y-1 transition-all duration-300
             flex flex-col"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.headline}
                      className="h-48 w-full object-cover"
                    />
                  )}

                  <div className="text-white p-4 flex flex-col flex-1">
                    <h2
                      className="text-lg font-bold mb-2 overflow-hidden
      [display:-webkit-box]
      [-webkit-line-clamp:2]
      [-webkit-box-orient:vertical]"
                    >
                      {item.headline}
                    </h2>

                    <p
                      className="text-gray-400 text-sm overflow-hidden
      [display:-webkit-box]
      [-webkit-line-clamp:3]
      [-webkit-box-orient:vertical]"
                    >
                      {item.description}
                    </p>

                    <div className="text-gray-500 text-xs mt-auto pt-3">
                      Source: {item.source}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default News;
