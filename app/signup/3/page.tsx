'use client'
import Camera from '@/components/Camera';
import { useUserStore } from '@/lib/userStore'
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

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