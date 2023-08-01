import { create } from "zustand";

const initialState = {
	name: "",
	phoneNumber: "",
	externalImgId: "",
	upiID: "",
};

export type UserType = {
	name: string;
	phoneNumber: string;
	externalImgId: string;
	upiID: string;
};

type userStore = {
	user: UserType;
	setUser: (userDetails: UserType) => void;
	resetUser: () => void;
};

export const useUserStore = create<userStore>((set) => ({
	user: initialState,
	setUser: (userDetails: UserType) => set({ user: { ...userDetails } }),
	resetUser:() => set({ user: initialState })
}));

