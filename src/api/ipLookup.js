import { handleErrors } from '../helper/sentryErrorHandling'

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
        .then(handleErrors)
        .then(res=>res.json())
        .then(response => {
            return transform(response)
        })
        .catch((err) => {
            // do not send this to Sentry, as some ad-blocker can block this request
            throw err
        })
}
