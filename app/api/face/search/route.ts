import { NextRequest, NextResponse } from "next/server";
import { searchFaceByImage } from "../../awsRekognition";

export async function POST(request: NextRequest) {
	const { collectionID, imgBase64 } = await request.json();
	const imgBuffer = Buffer.from(imgBase64, "base64url");
	try {
		const res = await searchFaceByImage(collectionID, imgBuffer);
		if (res.FaceMatches?.length === 0)
			return NextResponse.json({ success: false, error: "face not found" });
		return NextResponse.json({ success: true, data: res.FaceMatches![0] });
	} catch (error: any) {
		return NextResponse.json({ success: false, error: error.message });
	}
}
