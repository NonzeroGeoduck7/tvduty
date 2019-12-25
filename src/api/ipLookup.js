
const transform = (data) => {
    return {
        "ip": data.ip,
        "postal": data.postal,
        "city": data.city,
        "country": data.country,
        "org": data.org
    }
}

export const getIpInformation = async () => {
    return fetch('https://ipapi.co/json')
        .then(res => res.json())
        .then(response => {
            return transform(response)
        })
}
