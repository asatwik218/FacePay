"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import PayingSVG from "@/public/assets/paying_money.svg"

import { UserType, useUserStore } from "@/lib/userStore";
import { db } from "@/lib/firebase";
import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { BsCurrencyRupee } from "react-icons/bs";

type Props = {
	params: { id: string };
};

const PaymentPage = ({ params: { id } }: Props) => {
	const router = useRouter();
	const [amt, setAmt] = useState("");

	const [receiver, setReceiver] = useState<UserType | null>(null);

	const getReceiverData = async () => {
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
			setReceiver(userDetails);
			console.log(receiver);
		} catch (error: any) {
			console.log(error.message);
		}
	};

	useEffect(() => {
		getReceiverData();
	}, []);

	return (
		<div className='w-full h-screen flex flex-col items-center justify-center gap-3 p-5'>
			<img src='/assets/transfer_money.png' alt="" className="" />
			<h3 className='text-2xl '>Paying <span className="font-bold text-blue-800">{receiver?.name}</span></h3>
			<h3 className='text-xl font-bold text-blue-800'>{receiver?.upiID}</h3>
			<h3 className='text-xl font-bold text-blue-800 '>{receiver?.phoneNumber}</h3>
			<div className='flex items-center  gap-x-2 mb-5 p-3 border-2 rounded-lg  border-gray-400 focus-within:border-blue-800 focus-within:border-2 text-gray-500 focus-within:text-blue-800'>
				<BsCurrencyRupee className='w-6 h-6' />
				<input
					type='number'
					placeholder='Enter Amount'
					value={amt}
					onChange={(e) => setAmt(e.target.value)}
					className='focus:outline-none focus:border-none text-xl text-black focus:text-blue-800'
				/>
			</div>

			<Link
				href={`upi://pay?pa=${receiver?.upiID} & amp; pn=${receiver?.name} & amp;cu=INR & am=${amt}`}
				className='bg-blue-800 w-full p-3 justify-center rounded-lg flex gap-x-2 items-center text-white text-center text-lg font-semibold tracking-wider active:bg-blue-500'
			>
				PAY
			</Link>
		</div>
	);
};

export default PaymentPage;
