import { NextResponse } from "next/server";
import { vectorDB } from "@/lib/qdrant";

export async function POST() {
  try {
    await vectorDB.initializeCollection();
    
    const info = await vectorDB.getCollectionInfo();
    
    return NextResponse.json({
      message: "Vector database initialized successfully",
      collectionInfo: info,
    });
  } catch (error) {
    console.error("Error initializing database:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const info = await vectorDB.getCollectionInfo();
    
    return NextResponse.json({
      collectionInfo: info,
    });
  } catch (error) {
    console.error("Error getting database info:", error);
    return NextResponse.json(
      { error: "Failed to get database info" },
      { status: 500 }
    );
  }
}
