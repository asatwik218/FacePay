"use client";
import { RecaptchaVerifier, User, signInWithPhoneNumber } from "@firebase/auth";
import React, { useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input/input";
import OtpInput from "react-otp-input";
import { BsPhone } from "react-icons/bs";
import { BiLoaderAlt } from "react-icons/bi";

import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { UserType, useUserStore } from "@/lib/userStore";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import Image from "next/image";

function PhoneAuth() {
	const [phoneNumber, setPhoneNumber] = useState<string>();
	const [otp, setOtp] = useState("");
	const [OTPsent, setOTPSent] = useState(false);
	const [isNewUser, setIsNewUser] = useState(false);

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const router = useRouter();

	const { user, setUser } = useUserStore();

	//google phone login captcha verification
	const onCapthaVerify = () => {
		try {
			if (!window.recaptchaVerifier) {
				window.recaptchaVerifier = new RecaptchaVerifier(
					auth,
					"recaptha-verifier",
					{
						size: "invisible",
						callback: (response: any) => {
							// reCAPTCHA solved, allow signInWithPhoneNumber.
							sendOTP();
						},
						"expired-callback": () => {
							// Response expired. Ask user to solve reCAPTCHA again.
							// onCapthaVerify();
						},
					}
				);
			}
		} catch (error: any) {
			console.log("captcha validation error", error.message);
		}
	};

	const verifyOtp = async () => {
		setIsLoading(true);
		try {
			//confirm otp
			await window.confirmationResult.confirm(otp);

			if (isNewUser) {
				router.replace("/signup/2");
			} else {
				if (!localStorage.getItem("isAuthenticated")) {
					localStorage.setItem("isAuthenticated", "true");
				}
				router.replace("/");
			}
		} catch (error: any) {
			//if invalid/wrong OTP
			console.log("error in verifying otp", error);
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	const sendOTP = async () => {
		setIsLoading(true);
		setError("");

		try {
			if (phoneNumber && isValidPhoneNumber(phoneNumber)) {
				//query database for user with phone number
				const userQuery = query(
					collection(db, "users"),
					where("phoneNumber", "==", phoneNumber)
				);
				const userDetails = (await getDocs(userQuery)).docs.map((doc) => ({
					...doc.data(),
				}))[0] as UserType;

				//if user already exists , do not signup instead login
				if (userDetails) {
					setUser(userDetails);
					setIsNewUser(false);
				} else {
					setIsNewUser(true);
					setUser({ ...user, phoneNumber });
				}
				console.log(user);

				//invisible captcha verify and send otp
				onCapthaVerify();
				const appVerifier = window.recaptchaVerifier;
				const confirmationResult = await signInWithPhoneNumber(
					auth,
					phoneNumber,
					appVerifier
				);
				window.confirmationResult = confirmationResult;
				console.log("otp sent");
				setOTPSent(true);
			}
		} catch (error: any) {
			console.log("error in sending otp", error.message);
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='flex  flex-col mx-6 my-8'>
			<Image
				src='/assets/face-id.jpg'
				alt='signup-illustration'
				className='m-auto'
				width={300}
				height={300}
			/>
			<h2 className='text-6xl font-extrabold text-blue-800 my-2'>Hey,</h2>
			<div className=''>
				<div id='recaptha-verifier'></div>
				{OTPsent ? (
					<>
						<div className='my-7 flex flex-col gap-y-5 items-center'>
							<h4 className='text-xl'>
								OTP sent at{" "}
								<span className='text-blue-800'>{user.phoneNumber}</span>
							</h4>
							<OtpInput
								value={otp}
								onChange={setOtp}
								numInputs={6}
								renderInput={(props) => <input {...props} />}
								containerStyle='w-full flex justify-center space-x-3 '
								inputStyle='border-2 border-gray-400 rounded-lg text-xl text-center focus:outline-none focus:border-blue-800'
							/>
							<button
								onClick={verifyOtp}
								disabled={isLoading}
								className='bg-blue-800 w-full p-3 justify-center rounded-lg flex gap-x-2 items-center text-white text-center text-lg font-semibold tracking-wider active:bg-blue-500'
							>
								{isLoading && (
									<BiLoaderAlt className=' animate-spin w-6 h-6 font-bold' />
								)}
								{isNewUser ? "Sign Up" : "Login"}
							</button>
							<div className='flex w-full justify-end'>
								<p className='font-semibold text-gray-600'>
									Not Your Number?
									<span
										className='font-bold mx-1 text-blue-800 active:text-blue-800'
										onClick={() => {
											setOTPSent(false);
										}}
									>
										Go Back{" "}
									</span>
								</p>
							</div>
						</div>
					</>
				) : (
					<>
						<div className='text-xl  mt-5 mb-1  text-gray-500'>
							Phone Number
						</div>
						<div className='flex items-center  gap-x-2 mb-5 p-3 border-2 rounded-lg  border-gray-400 focus-within:border-blue-800 focus-within:border-2 text-gray-400 focus-within:text-blue-800'>
							<BsPhone className='w-7 h-7 mr-1 ' />
							<PhoneInput
								className='focus:outline-none text-xl peer '
								country='IN'
								placeholder='2112900999'
								value={phoneNumber}
								onChange={setPhoneNumber}
								required
							/>
						</div>
						<button
							onClick={sendOTP}
							disabled={isLoading}
							className='bg-blue-800 w-full p-3 justify-center rounded-lg flex gap-x-2 items-center text-white text-center text-lg font-semibold tracking-wider active:bg-blue-500'
						>
							{isLoading && (
								<BiLoaderAlt className=' animate-spin w-6 h-6 font-bold' />
							)}
							SEND OTP
						</button>
						<p>{error}</p>
					</>
				)}
			</div>
		</div>
	);
}

export default PhoneAuth;
