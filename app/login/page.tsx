/** @format */

"use client";
import "react-phone-number-input/style.css";
import React, { useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input/input";
import { RecaptchaVerifier, User, signInWithPhoneNumber } from "@firebase/auth";
import OtpInput from "react-otp-input";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";

type Props = {};

const LoginPage = (props: Props) => {
	const [phNumber, setPhNumber] = useState();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [otp, setOtp] = useState("");
	const [showInput, setShowInput] = useState(false);
	const [user, setUser] = useState<User>();

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

	const sendOTP = () => {
		setError("");
		setLoading(true);
		console.log(phNumber);
		if (phNumber && isValidPhoneNumber(phNumber)) {
			console.log("valid");
			onCapthaVerify();
			const appVerifier = window.recaptchaVerifier;
			console.log(appVerifier);
			signInWithPhoneNumber(auth, phNumber, appVerifier)
				.then((confirmationResult) => {
					window.confirmationResult = confirmationResult;
					console.log("otp sent");
				})
				.catch((error) => {
					console.log(error);
				});
		} else {
			setError("Invalid Phone Number");
			console.log("invalid");
		}
		setLoading(false);
	};

	function onOTPVerify() {
		setLoading(true);
		window.confirmationResult
			.confirm(otp)
			.then(async (res) => {
				console.log(res);
				setUser(res.user);
				setLoading(false);
			})
			.catch((err) => {
				console.log(err);
				setLoading(false);
			});
	}

	return (
		<main className='text-black  flex flex-col gap-3 items-center justify-center w-screen h-screen'>
			<div id='recaptha-verifier'></div>
			<PhoneInput
				className='border-2 border-black'
				country='IN'
				placeholder='Enter phone number'
				value={phNumber}
				onChange={setPhNumber as any}
			/>
			<p> {error} </p>
			<Button variant={"outline"} onClick={sendOTP}>
				Send OTP
			</Button>

			<OtpInput
				value={otp}
				onChange={setOtp}
				numInputs={6}
				renderSeparator={<span>-</span>}
				renderInput={(props) => <input {...props} />}
			/>
			<Button variant={"outline"} onClick={onOTPVerify}>
				Verify OTP
			</Button>
		</main>
	);
};

export default LoginPage;
