import { NextRequest, NextResponse } from "next/server";
import { searchFaceByImage } from "../../awsRekognition";

export async function POST(request: NextRequest) {
	const { collectionID,imgBase64 } = await request.json();
	const imgBuffer = Buffer.from(imgBase64, "base64url");
  try {
    const res =  await searchFaceByImage(collectionID,imgBuffer);
    console.log(res)
    return NextResponse.json({res})
  } catch (error:any) {
    return NextResponse.json({error:error.message})
  }


}
