'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import TripPage from './_components/maps';


interface Place {
  Name: string;
  City: string;
  Type: string;
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
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);
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

  const handleCurrentLocationToggle = async (value: boolean) => {
    setUseCurrentLocation(value);
    if (value) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude.toString());
            setLongitude(position.coords.longitude.toString());
          },
          (error) => {
            console.error('Error getting location:', error);
            alert('Unable to fetch location. Please allow location access or enter it manually.');
            setUseCurrentLocation(false);
          }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
        setUseCurrentLocation(false);
      }
    } else {
      setLatitude('');
      setLongitude('');
    }
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
        {!(output && output.length > 0) ? ( <>
        <div className="flex flex-col gap-8">
          {!useCurrentLocation && (
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-gray-500 text-gray-700 rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          )}
          <div className="flex text-gray-700 items-center justify-between">
            <span>Use current location as start location?</span>
            <div className="flex items-center space-x-4">
              <button
                className={`py-1 px-4 rounded-full ${useCurrentLocation ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                onClick={() => handleCurrentLocationToggle(true)}
              >
                Yes
              </button>
              <button
                className={`py-1 px-4 rounded-full ${!useCurrentLocation ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                onClick={() => handleCurrentLocationToggle(false)}
              >
                No
              </button>
            </div>
          </div>
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
            </>
          ) : ( <>
            <TripPage output={output} current = {(city && !latitude) ? false : true} />
            <button
              onClick={() => setOutput(null)}
              className="bg-red-500 text-white py-2 px-8 rounded-full shadow-[0_4px_20px_rgba(239,68,68,0.8)] focus:outline-none focus:ring-2 focus:ring-red-300"
              disabled={loading}
            >
              Try more recommendations
            </button>
            </>
          )}
        </div>
      </div>
  );
}
