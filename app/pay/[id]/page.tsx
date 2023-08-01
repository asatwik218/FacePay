"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { UserType, useUserStore } from "@/lib/userStore";
import { db } from "@/lib/firebase";
import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";

type Props = {};

const PaymentPage = ({ params: { id } }: { params: { id: string } }) => {
	const router = useRouter();
	const [amt, setAmt] = useState("");
	// const [user,setUser] = useState<UserType|null>(null)
	const {user, setUser} = useUserStore();
	const getUserData = async () => {
		try {
			console.log(id);
			const userQuery = query(
				collection(db, "users"),
				where("externalImgId", "==", id)
			);
			const userDetails = (await getDocs(userQuery)).docs.map((doc) => ({
				...doc.data(),
			}))[0] as UserType;

			if (!userDetails) {
				console.log("User not found");
				router.push("/");
			}
			// useUserStore.setState(() => ({ ...userDetails }));
			// const { user } = useUserStore.getState();

			setUser(userDetails)
			console.log(user);
			
		} catch (error: any) {
			console.log(error.message);
		}
	};

	useEffect(() => {
		getUserData();
	}, []);

	return (
		<div>
			<h3>Name:{user?.name}</h3>
			<h3>UPI ID:{user?.upiID}</h3>
			<h3>Phone Number:{user?.phoneNumber}</h3>
			<input
				type='number'
				placeholder='enter Amount'
				value={amt}
				onChange={(e) => setAmt(e.target.value)}
			/>
			<Link
				href={`upi://pay?pa=${user?.upiID} & amp; pn=${user?.name} & amp;cu=INR & am=${amt}`}
			>
				<Button>Pay</Button>
			</Link>
		</div>
	);
};

export default PaymentPage;
