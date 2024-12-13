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

    const dayPlanFormat = `[{"Date":"YYYY-MM-DD","Places":[{"Name":"Place Name","City":"City Name","Type":"Destination Type","DistanceFromUser": "Distance","Latitude":0.0000,"Longitude":0.0000}]}]`;
  
    if (latitude && longitude) {
      return (
        `My latitudinal and longitudinal coordinates are ${latitude} latitude ${longitude} longitude\n` +
        "Suggest me places to visit within a range of 150 Km strict.\n" +
        `My location preferences to visit are ${preferences}.\n` +
        `The journey start date is ${startDate}. The journey end date is ${endDate}.\n` +
        "Please also take into account the weather conditions and month of the location and try to make a round trip to comeback to the start location.\n" +
        "Don't give repetitive locations and give unique preference of locations for each day.\n"+
        `Give your response strictly in this format.:${dayPlanFormat}\n. No text only json response in the format given nothing else(no spaces no next line).`
      );
    } else {
      return (
        `Suggest me places to visit in ${city}.\n` +
        `My location preferences to visit are ${preferences}.\n` +
        `The journey start date is ${startDate}. The journey end date is ${endDate}.\n` +
        "Please also take into account the weather conditions and month of the location and try to make a round trip to comeback to the start location.\n" +
        "Don't give repetitive locations and give unique preference of locations for each day." +
        `Give your response strictly in this format.:${dayPlanFormat}\n. No text only json response in the format given nothing else(no spaces no next line).`
      );
    }
  }
  

// POST handler for the API route
export async function POST(req: Request) {
  try {
    const body: RecommendationRequest = await req.json();

    const { city, startDate, endDate, preference, latitude, longitude } = body;

    // Validate input
    if (!startDate || !endDate) {
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent(query);

    const generatedResponse = await result.response.text();

    return NextResponse.json({ query, output: generatedResponse }, { status: 200 });
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return NextResponse.json({ error: "Failed to generate recommendation" }, { status: 500 });
  }
}