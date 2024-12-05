'use client';

import { useState } from 'react';

interface Place {
  Name: string;
  City: string;
  TypeOfDestination: string;
  DistanceFromUser: string;
  Latitude: number;
  Longitude: number;
}

interface DayPlan {
  Date: string;
  Places: Place[];
}

export default function Home() {
  const [city, setCity] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [preference, setPreference] = useState<string[]>([]);
  const [output, setOutput] = useState<DayPlan[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    const data = {
      city,
      latitude: latitude || undefined,  // Only include if provided
      longitude: longitude || undefined, // Only include if provided
      startDate,
      endDate,
      preference,
    };

    setLoading(true); // Start loading state

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendation');
      }

      const json = await response.json();
      const jsonRemove = json.output.replace(/\\n/g, '').replace(/\\"/g, '"');
      console.log(jsonRemove);
      const parsedOutput = JSON.parse(jsonRemove.trim());
      console.log(parsedOutput);
      // const parsedOutput: DayPlan[] = JSON.parse(json.output.trim());
      setOutput(parsedOutput);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
    } finally {
      setLoading(false); // Stop loading state after the fetch
    }
  };
  // console.log(output);
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-full max-w-2xl p-6 bg-gray-50 rounded-xl shadow-lg">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Ask the AI for Travel Recommendations
        </h1>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Latitude (optional)"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Longitude (optional)"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="text"
            placeholder="Start Date (e.g. 12-05-2024)"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="End Date (e.g. 16-05-2024)"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Enter your preferences (e.g. Historical, Nature)"
            value={preference.join(', ')}
            onChange={(e) => setPreference(e.target.value.split(',').map((p) => p.trim()))}
            className="w-full h-40 p-4 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Get Recommendation'}
          </button>
        </div>
        {output && output.length > 0 &&  (
        <div className="mt-6 space-y-8">
          {output.map((dayPlan, index) => (
            <div key={index} className="bg-gray-100 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Date: {dayPlan.Date}</h2>
              <div className="space-y-4">
                {dayPlan.Places.map((place, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-gray-600 font-semibold text-lg">{place.Name}</h3>
                    <p className="text-gray-600">City: {place.City}</p>
                    <p className="text-gray-600">Type of Destination: {place.TypeOfDestination}</p>
                    <p className="text-gray-600">Distance: {place.DistanceFromUser}</p>
                    <p className="text-gray-600">Coordinates: {place.Latitude}, {place.Longitude}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {output && output.length === 0 && (
        <p className="mt-6 text-center text-gray-600">No recommendations available.</p>
      )}
      </div>
    </div>
  );
}
