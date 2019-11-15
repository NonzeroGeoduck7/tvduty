
export const seasonEpisodeNotation = (seasonNr, episodeNr) => {
    var season = seasonNr
    if (season < 10) season = '0'+season

    var episode = episodeNr
    if (episode < 10) episode = '0'+episode

    return 's'+season+'e'+episode
}

export const assureHttpsUrl = (url) => {
    if (url.startsWith("http")){
        return url.replace("http","https")
    } else {
        console.log("unknown url format: "+url)
        return null
    }
}

export const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window
    return {
        width,
        height
    }
}
