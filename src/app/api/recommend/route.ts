import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";


  interface RecommendationRequest {
    city?: string;
    startDate: string;
    endDate: string;
    preference: string[];
    latitude?: string;
    longitude?: string;
  }

  // Utility Function to Format Query
  function createQuery({
    city,
    startDate,
    endDate,
    preference,
    latitude,
    longitude,
  }: RecommendationRequest): string {
    const preferences = preference.join(", ");

    const dayPlanFormat = `[{"Date":"YYYY-MM-DD","Places":[{"Name":"Place Name","City":"City Name","Type":"Destination Type","DistanceFromUser": "Distance","Latitude":0.0000,"Longitude":0.0000, "Rating":0.0, "Tips":"Tips"}]}]`;
  
    if (latitude && longitude) {
      return (
        `Give your response strictly in this format.:${dayPlanFormat}\n` +
        `My latitudinal and longitudinal coordinates are ${latitude} ${longitude}\n` +
        "Suggest me places to visit within a range of 200Km.\n" +
        `My location preferences to visit are ${preferences}.\n` +
        `The journey start date is ${startDate}. The journey end date is ${endDate}.\n` +
        "Please also take into account the weather conditions and month of the location and try to make a round trip\n" +
        "Don't give repetitive locations and give unique preference of locations for each day.\n"
      );
    } else {
      return (
        `Give your response strictly in this format.:${dayPlanFormat}\n` +
        `\nSuggest me places to visit in ${city}.\n` +
        `My location preferences to visit are ${preferences}.\n` +
        `The journey start date is ${startDate}. The journey end date is ${endDate}.\n` +
        "Please also take into account the weather conditions and month of the location and try to make a round trip\n" +
        "Don't give repetitive locations and give unique preference of locations for each day."
      );
    }
  }
  

// POST handler for the API route
export async function POST(req: Request) {
  try {
    const body: RecommendationRequest = await req.json();

    const { city, startDate, endDate, preference, latitude, longitude } = body;

    // Validate input
    if (!startDate || !endDate || !city) {
      return NextResponse.json(
        { error: "Missing required fields: startDate, endDate, or preference." },
        { status: 400 }
      );
    }

    // Create the query
    const query = createQuery({
      city,
      startDate,
      endDate,
      preference,
      latitude,
      longitude,
    });

    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY environment variable");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(query);

    const generatedResponse = await result.response.text();

    return NextResponse.json({ query, output: generatedResponse }, { status: 200 });
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return NextResponse.json({ error: "Failed to generate recommendation" }, { status: 500 });
  }
}