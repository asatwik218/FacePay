import { NextRequest, NextResponse } from "next/server";
import { listFaces } from "../../awsRekognition";


export async function GET(request:NextRequest){
  
  const {searchParams} = new URL(request.nextUrl)
  const collectionID = searchParams.get('collectionID') as string;
  console.log(collectionID)

  try {
    const faceIds = await listFaces(collectionID)
    return NextResponse.json({faceIds});

  } catch (error) {
    return NextResponse.json({error});
  }
}