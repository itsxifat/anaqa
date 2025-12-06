import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectDB();

    // FIX: Await params before accessing 'id' (Required in Next.js 15+)
    const { id } = await params;

    const user = await User.findById(id);

    // Check if user exists and has a custom image uploaded
    if (!user || !user.customImage || !user.customImage.data) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Serve the image buffer with the correct content type
    return new NextResponse(user.customImage.data, {
      headers: {
        "Content-Type": user.customImage.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for performance
      },
    });
  } catch (error) {
    console.error("Avatar API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}