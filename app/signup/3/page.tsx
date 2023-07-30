'use client'
import Camera from '@/components/Camera';
import { useUserStore } from '@/lib/userStore'
import React from 'react'

type Props = {}

const SignupStep3 = () => {
  const {user,setUser} = useUserStore();

  return (
    <div>
      <Camera operation='signup' name="Satwik Agarwal" phoneNumber="7001206144" />
    </div>
  )
}

export default SignupStep3