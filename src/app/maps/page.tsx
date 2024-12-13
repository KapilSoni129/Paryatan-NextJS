"use client"
import { useEffect, useState } from 'react';

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

type PlanType = {
    output: DayPlan[];
    current: boolean;
}

function TripPage({ output, current }: PlanType) {
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mapsInitialized, setMapsInitialized] = useState(false);

    // Initialize Google Maps
    useEffect(() => {
        if (window.google?.maps) {
            setMapsInitialized(true);
            setIsLoading(false);
            return;
        }

        const initMaps = () => {
            setMapsInitialized(true);
            setIsLoading(false);
        };

        try {
            const script = document.createElement('script');
            script.setAttribute('async', '');
            script.setAttribute('defer', '');
            script.setAttribute('src', 
                `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            );
            script.addEventListener('load', initMaps);
            script.addEventListener('error', () => {
                setError('Failed to load Google Maps');
                setIsLoading(false);
            });

            document.head.appendChild(script);
        } catch (error) {
            setError('Failed to initialize maps');
            setIsLoading(false);
            console.error('Failed to initialize maps:', error);
        }
    }, []);

    // Get user location
    useEffect(() => {
        if (!navigator.geolocation) {
            setUserLocation({ lat: 40.7128, lng: -74.0060 }); // NYC fallback
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            () => {
                setUserLocation({ lat: 40.7128, lng: -74.0060 }); // NYC fallback
            }
        );
    }, []);

    // Update map when day changes or location changes
    useEffect(() => {
        if (!mapsInitialized || !userLocation || !output.length || error) {
            return;
        }

        const mapDiv = document.getElementById(`map-${currentDayIndex}`);
        if (!mapDiv) return;

        try {
            const firstPlace = output[currentDayIndex].Places[0];
            const center = current ? userLocation : { lat: firstPlace.Latitude, lng: firstPlace.Longitude };
            
            const map = new google.maps.Map(mapDiv, {
                zoom: 10,
                center
            });

            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer({ map });

            const dayPlaces = output[currentDayIndex].Places;
            const waypoints = current 
                ? dayPlaces.map(place => ({
                    location: new google.maps.LatLng(place.Latitude, place.Longitude),
                    stopover: true
                  }))
                : dayPlaces.slice(1).map(place => ({
                    location: new google.maps.LatLng(place.Latitude, place.Longitude),
                    stopover: true
                  }));

            const request = {
                origin: current ? userLocation : { lat: firstPlace.Latitude, lng: firstPlace.Longitude },
                destination: current ? userLocation : { lat: firstPlace.Latitude, lng: firstPlace.Longitude },
                waypoints,
                travelMode: google.maps.TravelMode.DRIVING,
                optimizeWaypoints: true
            };

            directionsService.route(request, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(result);
                } else {
                    console.error("Directions request failed:", status);
                    setError('Failed to create route');
                }
            });
        } catch (error) {
            console.error('Map creation error:', error);
            setError('Error creating map');
        }
    }, [currentDayIndex, userLocation, mapsInitialized, output, error, current]);

    const handlePrevClick = () => {
        if (currentDayIndex > 0) {
            setCurrentDayIndex(currentDayIndex - 1);
        }
    };

    const handleNextClick = () => {
        if (currentDayIndex < output.length - 1) {
            setCurrentDayIndex(currentDayIndex + 1);
        }
    };

    if (error) {
        return (
            <div className="text-center p-4 text-red-600">
                {error}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="text-center p-4">
                Loading map...
            </div>
        );
    }

    if (!output.length) {
        return (
            <div className="text-center p-4">
                No trip data available
            </div>
        );
    }

    const dayPlan = output[currentDayIndex];

    return (
        <div className="my-6 space-y-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={handlePrevClick}
                    className="bg-gray-100 w-10 h-10 border-2 flex align-middle justify-center border-red-500 text-2xl text-gray-800 rounded-full hover:bg-gray-200 disabled:opacity-50"
                    disabled={currentDayIndex === 0}
                >
                    &lt;
                </button>
                <h2 className="text-xl font-semibold text-gray-700">{dayPlan.Date}</h2>
                <button
                    onClick={handleNextClick}
                    className="bg-gray-100 w-10 h-10 text-2xl border-2 flex align-middle justify-center border-red-500 text-gray-800 rounded-full hover:bg-gray-200 disabled:opacity-50"
                    disabled={currentDayIndex === output.length - 1}
                >
                    &gt;
                </button>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                <div 
                    id={`map-${currentDayIndex}`} 
                    className="w-full h-64 rounded-lg shadow-md mb-6"
                ></div>
                <div className="space-y-4">
                    {dayPlan.Places.map((place, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-gray-600 font-semibold text-lg">
                                {place.Name}
                            </div>
                            <p className="text-gray-600">City: {place.City}</p>
                            <p className="text-gray-600">
                                Type of Destination: {place.Type}
                            </p>
                            <p className="text-gray-600">
                                Distance: {place.DistanceFromUser}
                            </p>
                            <p className="text-gray-600">
                                Coordinates: {place.Latitude}, {place.Longitude}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TripPage;