import {
	IndexFacesCommand,
	ListCollectionsCommand,
	ListFacesCommand,
	RekognitionClient,
	SearchFacesByImageCommand,
} from "@aws-sdk/client-rekognition";

export const rekogClient = new RekognitionClient({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

export const indexFace = async (
	collectionID: string,
	externalImgId: string,
	img: Buffer
) => {
	try {
		//https://docs.aws.amazon.com/rekognition/latest/APIReference/API_IndexFaces.html
		const command = new IndexFacesCommand({
			CollectionId: collectionID,
			ExternalImageId: externalImgId,
			Image: {
				Bytes: img,
			},
			MaxFaces: 1,
			DetectionAttributes: ["EMOTIONS"],
		});

		const res = await rekogClient.send(command);
		console.log(res);
		return res;
	} catch (error) {
		console.log(error);
		throw new Error("failed to index face");
	}
};

export const searchFaceByImage = async (collectionID: string, img: Buffer) => {
	try {
		// https://docs.aws.amazon.com/rekognition/latest/APIReference/API_SearchFacesByImage.html
		const command = new SearchFacesByImageCommand({
			CollectionId: collectionID,
			Image: {
				Bytes: img,
			},
			MaxFaces: 1,
		});

		const res = await rekogClient.send(command);
		console.log(res);
		return res;
	} catch (error) {
		console.log("Failed to search face by image", error);
		throw new Error("Failed to search face by image");
	}
};


export const listFaces = async (collectionID: string) => {
	try {
		const command = new ListFacesCommand({
			CollectionId: collectionID,
		});
		const res = await rekogClient.send(command);
		const faceIDs = res.Faces?.map((face) => face.FaceId);
		console.log(faceIDs);
		return faceIDs;
	} catch (error) {
		console.log(error);
		throw new Error("failed to list faces");
	}
};
