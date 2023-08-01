"use client";
import { RecaptchaVerifier, User, signInWithPhoneNumber } from "@firebase/auth";
import React, { useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input/input";
import OtpInput from "react-otp-input";

import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { UserType, useUserStore } from "@/lib/userStore";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";

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
						"expired-callback": () => {},
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
		<div className='flex flex-col border w-full gap-2 rounded-sm border-gray-700 p-5 m-5'>
			{OTPsent ? (
				<>
					<h4>Otp sent at {user.phoneNumber}</h4>
					<OtpInput
						value={otp}
						onChange={setOtp}
						numInputs={6}
						renderInput={(props) => <input {...props} />}
						containerStyle='w-full flex justify-center items-end space-x-2'
						inputStyle={
							"w-12 h-12 border-2 text-center rounded bg-transparent outline-none border-gray-400 focus:border-gray-700 focus:text-gray-700 text-gray-400 "
						}
					/>
					<Button onClick={verifyOtp}>Verify</Button>
				</>
			) : (
				<>
					<div id='recaptha-verifier'></div>
					<div id='recaptha-verifier'></div>
					<label htmlFor=''>Enter phone Number</label>
					<PhoneInput
						className='border-2'
						country='IN'
						placeholder='xxxxxxxxxx'
						value={phoneNumber}
						onChange={setPhoneNumber}
					/>
					<Button onClick={sendOTP}>Send OTP</Button>
					<p>{error}</p>
				</>
			)}
		</div>
	);
}

export default PhoneAuth;
