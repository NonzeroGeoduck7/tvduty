// src/components/Loading.js

import React from 'react'
import Loader from 'react-loader-spinner'

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"

function Loading(props) {
  
  return (
    <Loader
        type="Watch"
        color="#FF0000"
        height={100}
        width={100}
      />
  )
}

export default Loading;
