import React, { useEffect, useState } from "react";

type Props = {};

const OtpInput = (props: Props) => {
	const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
	const [currInputIdx, setCurrInputIdx] = useState(0);

	const inputRef = React.useRef<HTMLInputElement>(null);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		idx: number
	) => {
		const value = e.target.value;
		const newOtp = [...otp];
		newOtp[idx] = value.substring(value.length - 1);

		if (!value) setCurrInputIdx(idx - 1);
		else setCurrInputIdx(idx + 1);
		setOtp(newOtp);
	};

	const handleKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
		idx: number
	) => {
		const key = e.key;
    console.log(key);
		if (key == "Backspace") {
			setCurrInputIdx(idx - 1);
		}
	};


	useEffect(() => {
		inputRef.current?.focus();
	}, [currInputIdx]);

	return (
		<div className='flex justify-center items-end space-x-2'>
			{otp.map((_, idx) => {
				return (
					<input
						ref={idx === currInputIdx ? inputRef : null}
						key={idx}
						className='w-12 h-12 border-2 text-center rounded bg-transparent outline-none border-gray-400 focus:border-gray-700 focus:text-gray-700 text-gray-400 '
						onChange={(e) => handleChange(e, idx)}
						onKeyDown={(e) => {
							handleKeyDown(e, idx);
						}}
						value={otp[idx]}
					/>
				);
			})}
		</div>
	);
};

export default OtpInput;
