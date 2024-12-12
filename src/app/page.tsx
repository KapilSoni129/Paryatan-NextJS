'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";


interface Place {
  Name: string;
  City: string;
  Type: string;
  DistanceFromUser: string;
  Latitude: number;
  Longitude: number;
  Rating: number;
  Tips: string;
}

interface DayPlan {
  Date: string;
  Places: Place[];
}

export default function Home() {
  const [city, setCity] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [startDates, setStartDate] = useState<Date | null>(null);
  const [endDates, setEndDate] = useState<Date | null>(null);
  const [output, setOutput] = useState<DayPlan[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    "Nature & Adventure": false,
    "Cultural & Religious": false,
    "Heritage & Architecture": false,
    "Wildlife & Safari": false,
    "Historical Sites": false,
    "Adventure Sports": false,
  });

  const handleToggle = (interest: string) => {
    setPreferences((prev: Record<string, boolean>) => ({
      ...prev,
      [interest]: !prev[interest],
    }));
  };
  
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
  };

  const handleSubmit = async () => {
    const preference = Object.keys(preferences).filter(
      (interest: string) => preferences[interest]
    );
    const startDate = startDates?.toLocaleDateString("en-IN");
    const endDate = endDates?.toLocaleDateString("en-IN");
    
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
      // console.log(jsonRemove);
      const parsedOutput = JSON.parse(jsonRemove.trim());
      // console.log(parsedOutput);
      // const parsedOutput: DayPlan[] = JSON.parse(json.output.trim());
      setOutput(parsedOutput);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
    } finally {
      setLoading(false); // Stop loading state after the fetch
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-red-50 to-red-100 font-sans">
      <div className="w-full max-w-2xl p-6">
        <div className="flex flex-row justify-center mb-10">
          <div className="mb-6 flex items-center justify-center">
            <img
              src="/ic_launcher.png"
              alt="Icon"
              className="sm:h-24 sm:min-w-24 h-20 min-w-20 rounded-full shadow-[0_4px_20px_rgba(239,68,68,0.8)]"
            />
          </div>
          <div className="text-lg sm:text-2xl font-semibold text-left flex flex-col justify-center ml-10 text-gray-600 mb-6">
            <div className='font-bold'>Paryatan:</div>
            <div className='text-sm sm:text-lg'>Ask us for travel recommendations</div>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border border-gray-500 text-gray-700 rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <div className='flex flex-col w-full text-gray-700'>
            <label htmlFor="startDate" className="block text-lg font-medium ml-2 mb-1">
              Start Date
            </label>
            <DatePicker
              selected={startDates}
              onChange={handleStartDateChange}
              dateFormat="dd-MM-yyyy"
              showPopperArrow={false}
              timeInputLabel="Time"
              className="w-full border border-gray-500 rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-red-500"
              minDate={new Date()} // Optional: to prevent selecting past dates
              popperPlacement="bottom"
            />
          </div>
          <div className="flex flex-col w-full mb-4 text-gray-700">
            <label htmlFor="endDate" className="block text-lg font-medium ">
              End Date
            </label>
            <DatePicker
              selected={endDates}
              onChange={handleEndDateChange}
              dateFormat="dd-MM-yyyy"
              showPopperArrow={false}
              timeInputLabel="Time"
              className="w-full border border-gray-500 rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-red-500"
              minDate={startDates ? startDates : new Date()}
              popperPlacement="bottom"
            />
          </div>
        </div>
          <div className="w-full text-gray-700 mb-5 border-red-300 rounded-xl p-6 border-2">
            <div className="text-xl font-bold mb-4">Select your Interests</div>
            <div className="flex flex-col space-y-2">
            {Object.keys(preferences).map((interest) => (
              <div key={interest} className="flex items-center">
                <input
                  type="checkbox"
                  id={interest}
                  className="w-5 h-5 rounded-full border-2 border-red-500 bg-white checked:bg-red-500 checked:ring-red-500 appearance-none"
                  checked={preferences[interest]}
                  onChange={() => handleToggle(interest)}
                />
                <label htmlFor={interest} className="ml-2">{interest}</label>
              </div>
            ))}
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-red-500 text-white py-2 px-8 rounded-full shadow-[0_4px_20px_rgba(239,68,68,0.8)] focus:outline-none focus:ring-2 focus:ring-red-300"
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
                    <div className="text-gray-600 font-semibold text-lg">{place.Name}</div>
                    <p className="text-gray-600">City: {place.City}</p>
                    <p className="text-gray-600">Type of Destination: {place.Type}</p>
                    <p className="text-gray-600">Distance: {place.DistanceFromUser}</p>
                    <p className="text-gray-600">Coordinates: {place.Latitude}, {place.Longitude}</p>
                    <p className="text-gray-600">Rating: {place.Rating}</p>
                    <p className="text-gray-600">Tips: {place.Tips}</p>
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
  );
}
