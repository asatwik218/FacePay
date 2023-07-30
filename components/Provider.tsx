'use client'

import React, { useEffect, useState } from 'react'
import Camera from './Camera'

type Props = {}

const Provider = (props: Props) => {
  const [isMounted,setIsMounted] = useState(false)

  useEffect(()=>{
    setIsMounted(true)
  },[])

  if(!isMounted){
    return null;
  }

  return (
    <>
      <Camera/>
    </>
  )
}

export default Provider