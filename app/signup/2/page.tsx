"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/lib/userStore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {};

const SignupStep2 = (props: Props) => {
	const { user, setUser } = useUserStore();
	const [name, setName] = useState("");
	const [upiID, setUpiID] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

  const router = useRouter();

	const handleSubmit = () => {
		setIsLoading(true);
		setError("");

		setName((prev) => prev.trim());
		setUpiID((prev) => prev.trim());
		if (!name || !upiID) {
			setError("Please fill all the fields");
		}
		const userDetails = { ...user, name, upiID };
		console.log(userDetails);
		setUser(userDetails);

		setIsLoading(false);
    router.push("/signup/3");
	};

  useEffect(() => {
    if(!user.phoneNumber) {
      router.push("/signup/1");
    }

  },[])

	console.log(user);
	return (
		<>
			<div>
				<Label htmlFor='name'>Full Name:</Label>
				<Input
					id='name'
					placeholder='eg.John Smith'
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
			</div>
			<div>
				<Label htmlFor='upi-id'>UPI Id:</Label>
				<Input
					id='upi-id'
					placeholder='eg.JohnSmith@okhdfcbank'
					value={upiID}
					onChange={(e) => setUpiID(e.target.value)}
					required
				/>
			</div>
			{error && <p className='text-red-500'>{error}</p>}
			<Button disabled={isLoading} onClick={handleSubmit}>
				Next
			</Button>
		</>
	);
};

export default SignupStep2;
