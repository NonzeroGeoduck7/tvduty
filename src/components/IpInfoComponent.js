import React, { useState, useEffect } from 'react'
import { getIpInformation } from '../api/ipLookup'
import styled from 'styled-components'
import Loading from './Loading'

const IpInfoDiv = styled.div`
    font-size: 12px;
    text-align: center;
` //color: blue;font-weight: bold;

const IpInfoComponent = React.memo(function IpInfoComponent() {

    let [ipInfoLoading, setIpInfoLoading] = useState(false)
    let [ipInfo, setIpInfo] = useState({})
    let [hasError, setHasError] = useState(false)

    useEffect(()=>{
        setIpInfoLoading(true)

        getIpInformation().then((res)=>{
            setIpInfo(res)
            setIpInfoLoading(false)
        })
        .catch((err) => {
            console.log("Error while fetching connection information: "+err)
            setHasError(true)
        })

    }, [])

    return (
        hasError?<IpInfoDiv><p>unable to resolve connection information</p></IpInfoDiv>:
        ipInfoLoading?<Loading/>:
		<IpInfoDiv>
            {`Your IP address is ${ipInfo.ip} and points to ${ipInfo.postal} ${ipInfo.city}, ${ipInfo.country}. Organization: ${ipInfo.org}`}
        </IpInfoDiv>
  	)
})

export default IpInfoComponent
