"use client";
import { RecaptchaVerifier, User, signInWithPhoneNumber } from "@firebase/auth";
import React, { use, useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input/input";
import OtpInput from "react-otp-input";

import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { UserType, useUserStore } from "@/lib/userStore";
import { useRouter } from "next/navigation";
import { collection, query, where } from "firebase/firestore";

function PhoneAuth() {
	const [phoneNumber, setPhoneNumber] = useState<string>();
	const [otp, setOtp] = useState("");
	const [OTPsent, setOTPSent] = useState(false);
	const [isNewUser, setIsNewUser] = useState(false);

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const router = useRouter();

	//user global state
	const { user, setUser } = useUserStore();
	console.log(user);

	//google phone login captcha verification
	const onCapthaVerify = () => {
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
	};

	//what to do on signup/new user
	const onSignup = (phNo: string) => {
		const userDetails: UserType = { ...user, phoneNumber: phNo! };
		setUser(userDetails);
		router.replace("/signup/2");
	};

	const verifyOtp = async () => {
		setIsLoading(true);
		try {
			//confirm otp
			const res = await window.confirmationResult.confirm(otp);
			const phNo = res.user.phoneNumber;
			


			onSignup(res.user.phoneNumber!);
		} catch (error: any) {
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
			//query database for user with phone number

			//setIsNewUser(false);

			//if user does not exist, create user and send otp
			// setIsNewUser(true);

			//send otp
			if (phoneNumber && isValidPhoneNumber(phoneNumber)) {
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
		}
	};

	return (
		<div className='flex flex-col border w-full gap-2 rounded-sm border-gray-700 p-5 m-5'>
			{OTPsent ? (
				<>
					<h4>Otp sent at +91 {phoneNumber}</h4>
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
