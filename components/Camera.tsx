"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";
import { useUserStore } from "@/lib/userStore";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { isMobile } from "react-device-detect";

type Props = {
	operation: "signup" | "pay";
};

const Camera = ({ operation }: Props) => {
	const camRef = useRef<Webcam>(null);
	const imgRef = useRef<HTMLImageElement>(null);
	const router = useRouter();

	const { user, setUser } = useUserStore();

	const [error, setError] = useState("");

	const loadModels = async () => {
		await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
	};

	const handleSignup = async () => {
		try {
			const imageSrc = imgRef.current?.src;
			const imgBase64 = imageSrc?.replace("data:image/jpeg;base64,", "");

			const initials = user.name
				.split(" ")
				.map((word) => word[0])
				.join("");
			//external Img id = initials + phoneNumber
			const externalImgId = `${initials}-${user.phoneNumber.substring(3)}`;
			setUser({ ...user, externalImgId });

			const collectionID = process.env.NEXT_PUBLIC_AWS_COLLECTION_ID;

			//send https req to add face to aws collection
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
				const doc = await addDoc(collection(db, "users"), {
					...user,
					externalImgId,
				});
				console.log(doc);

				localStorage.setItem("isAuthenticated", "true");
				//redirect to main page
				router.push("/");
			} else {
				setError(response.error);
			}
		} catch (error: any) {
			console.log("handle signup error", error.message);
		}
	};

	const handlePayment = async () => {
		setError("");

		try {
			const imageSrc = imgRef.current?.src;
			const imgBase64 = imageSrc?.replace("data:image/jpeg;base64,", "");
			const collectionID = process.env.NEXT_PUBLIC_AWS_COLLECTION_ID;

			const res = await fetch("/api/face/search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ collectionID, imgBase64 }),
			});
			const response = await res.json();

			if (response.success === true) {
				//get the imageIdOfThe recognised face
				const externalImgId = response.data.Face.ExternalImageId;
				//navigate to payment page
				router.push(`/pay/${externalImgId}`);
			} else {
				console.log("fail");
			}
		} catch (error: any) {
			setError(error.message);
			console.error(error);
		}
	};

	useEffect(() => {
		loadModels();
	}, [imgRef, camRef]);

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
	let videoConstraints;
	if (isMobile) {
		console.log("mobile")
		videoConstraints = {
			width: 1280,
			height: 720,
			facingMode: { exact: operation === "pay" ? "environment" : "user" },
		}
	} else {
	 videoConstraints = {
		width: window.innerWidth,
		height: window.innerHeight,
		facingMode: { exact: "user" },
	};
	}
	// const videoConstraints = {
	// 	width: window.innerWidth,
	// 	height: window.innerHeight,
	// 	facingMode: "user",
	// };

	return (
		<>
			<div className=' h-screen w-screen m-0 p-0 relative'>
				<Webcam
					ref={camRef}
					audio={false}
					screenshotFormat='image/jpeg'
					videoConstraints={videoConstraints}
					className='h-screen w-screen object-contain'
				/>
				<img className='hidden' src='' alt='' ref={imgRef} />
			</div>
			<div
				className='absolute border-4 border-white z-10'
				id='camera-overlay'
			></div>
		</>
	);
};

export default Camera;
