"use client";
import { auth } from "@/lib/firebase";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Camera = dynamic(() => import("@/components/Camera"), { ssr: false });

export default function Home() {
	const router = useRouter();

	console.log(auth.currentUser);

	useEffect(() => {
		if (!localStorage.getItem("isAuthenticated")) {
			router.push("/signup/1");
		}
	}, []);

	return (
		<main className=''>
			<Camera operation='pay' />
		</main>
	);
}
