"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";

type Props = {
	operation: "signup" | "pay";
	name: string;
	phoneNumber: string;
};

const Camera = ({ operation, name, phoneNumber }: Props) => {
	const camRef = useRef<Webcam>(null);
	const imgRef = useRef<HTMLImageElement>(null);

	const [error, setError] = useState("");

	const loadModels = async () => {
		await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
	};

	const searchFace = async () => {
		setError("");
		const imageSrc = imgRef.current?.src;
		const imgBase64 = imageSrc?.replace("data:image/jpeg;base64,", "");

		try {
			const res = await fetch("/api/face/search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ collectionID: "testing-aws", imgBase64 }),
			});
			const data = await res.json();
			console.log(data);
		} catch (error: any) {
			setError(error.message);
			console.error(error);
		}
	};

	const handleSignup = async () => {
		try {
			const imageSrc = imgRef.current?.src;
			const imgBase64 = imageSrc?.replace("data:image/jpeg;base64,", "");

			const initials = name
				.split(" ")
				.map((word) => word[0])
				.join("");
			//external Img id = initials + phoneNumber
			const externalImgId = `${initials}-${phoneNumber}`;
			const collectionID = process.env.NEXT_PUBLIC_AWS_COLLECTION_ID;
			console.log(externalImgId, initials);

			const res = await fetch("/api/face/index", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					collectionID,
					externalImgId,
					imgBase64,
				}),
			});

			const response = await res.json();
			console.log(response);
			if (response.success == true) {

				//save user data to db

				//redirect to main page

			} else {
			}
		} catch (error: any) {
			console.log("handle signup error", error.message);
		}
	};

	const handlePayment = async () => {
		setError("");
		const imageSrc = imgRef.current?.src;
		const imgBase64 = imageSrc?.replace("data:image/jpeg;base64,", "");

		try {
			const res = await fetch("/api/face/search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ collectionID: "testing-aws", imgBase64 }),
			});

			console.log(res);
		} catch (error: any) {
			setError(error.message);
			console.error(error);
		}
	};

	useEffect(() => {
		loadModels();
	}, []);

	useEffect(() => {
		//using faceapi model to detect if there is face in the frame
		//if there is a frame then only send a request to backend therefore reducing calls to backend
		const detectFace = async () => {
			if (camRef.current) {
				try {
					const imageSrc = camRef?.current?.getScreenshot();
					imgRef.current!.src = imageSrc!; //set the image source to the image element
					const detection = await faceapi.detectSingleFace(
						imgRef.current!,
						new faceapi.TinyFaceDetectorOptions()
					);

					if (detection && detection?.score > 0.85) {
						//if a good face sample is detected then stop furthur detection
						clearInterval(intervalId);

						if (operation === "signup") {
							handleSignup();
						} else if (operation === "pay") {
							handlePayment();
						}
					}
					console.log(detection);
				} catch (error) {
					console.error(error);
				}
			}
		};

		// Start the interval and store the interval id
		const intervalId = setInterval(detectFace, 500);
		return () => clearInterval(intervalId);
	}, [imgRef, camRef]);

	const videoConstraints = {
		width: 1280,
		height: 720,
		facingMode: "user",
	};
	return (
		<div>
			<Webcam
				ref={camRef}
				audio={false}
				height={720}
				screenshotFormat='image/jpeg'
				width={1280}
				videoConstraints={videoConstraints}
			/>
			<img className='hidden' src='' alt='' ref={imgRef} />
			{/* <button onClick={detectFace}> detect </button> */}
		</div>
	);
};

export default Camera;
