import { NextRequest, NextResponse } from "next/server";

import { indexFace, searchFaceByImage } from "../../awsRekognition";

export async function POST(request: NextRequest) {
	try {
		const { collectionID, externalImgId, imgBase64 } = await request.json();
		const imgBuffer = Buffer.from(imgBase64, "base64url");
		//if face already exists in aws collection then dont index it again
		const faces = await searchFaceByImage(collectionID, imgBuffer);
		if (faces.FaceMatches?.length) {
			return NextResponse.json({
				success: false,
				error: "face already indexed",
			});
		}
		//index face in aws collection
		const res = await indexFace(collectionID, externalImgId, imgBuffer);
		console.log(res);
		return NextResponse.json({
			success: true,
			FaceRecords: res.FaceRecords![0],
		});
	} catch (error: any) {
		console.log(error);
		return NextResponse.json({ error: error.message });
	}
}
