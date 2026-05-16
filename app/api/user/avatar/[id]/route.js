import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { decryptBuffer } from "@/lib/encryption";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id).select('profilePicture');

    if (!user || !user.profilePicture?.data) {
      return new NextResponse("Not found", { status: 404 });
    }

    const decryptedImage = decryptBuffer(
      user.profilePicture.data,
      user.profilePicture.iv
    );

    return new NextResponse(decryptedImage, {
      headers: {
        "Content-Type": user.profilePicture.contentType || "image/jpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
