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

type UserStoreType = {
	user: UserType;
	setUser: (userDetails: UserType) => void;
	reset: () => void;
};

export const useUserStore = create<UserStoreType>((set) => ({
	user: initialState,
	setUser: (userDetails: UserType) => {
		set(() => ({ user: { ...userDetails } }));
	},
	reset: () => {
		set(() => ({ user: initialState }));
	},
}));
