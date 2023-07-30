import React from "react";
import dynamic from "next/dynamic";
const PhoneAuth = dynamic(() => import("@/components/PhoneAuth"), {
	ssr: false,
});

const SignupStep1 = () => {

	return (
		<>
			<PhoneAuth />
		</>
	);
};

export default SignupStep1;
