import { useState } from "react";

const Analyze = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/analyzeData"); // Your Express route
      const blob = await response.blob();
      setImage(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Error fetching graph:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold">Driver Speed Analysis</h1>
      <button
        onClick={fetchGraph}
        className="bg-red-600 px-6 py-3 rounded-lg hover:bg-red-700 transition"
      >
        {loading ? "Loading..." : "Generate Graph"}
      </button>

      {image && (
        <img src={image} alt="Driver Speed" className="mt-6 rounded-lg shadow-lg" />
      )}
    </div>
  );
};

export default Analyze;
