'use client'


import { useUserStore } from '@/lib/userStore'
import { useRouter } from 'next/navigation';
import dynamic from "next/dynamic"; 
import React, { useEffect } from 'react'

const Camera = dynamic(() => import("@/components/Camera"), { ssr: false });
type Props = {}

const SignupStep3 = () => {
  const {user,setUser} = useUserStore();
  const router = useRouter();
  useEffect(() => {
    if(!user.phoneNumber) {
      router.replace("/signup/1");
    }
    else if(!user.name || !user.upiID) {
      router.replace("/signup/2")
    }
  },[])

  return (
    <div>
      <Camera operation='signup' />
    </div>
  )
}

export default SignupStep3