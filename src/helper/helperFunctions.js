
export const seasonEpisodeNotation = (seasonNr, episodeNr) => {
    var season = seasonNr
    if (season < 10) season = '0'+season

    var episode = episodeNr
    if (episode < 10) episode = '0'+episode

    return 's'+season+'e'+episode
}

export const timeDiff = (time1, time2) => {
    time1 = Date.parse(time1)
    time2 = Date.parse(time2)

    if (time2 > time1){
        const tmp = time2
        time2 = time1
        time1 = tmp
    }

    const nrOfWeeks = Math.floor(( time1 - time2 ) / (86400000*7))
    var result = nrOfWeeks+' '+(nrOfWeeks===1?'week':'weeks')

    if (nrOfWeeks < 1){
        const nrOfDays = Math.floor(( time1 - time2 ) / (86400000))
        result = nrOfDays+' '+(nrOfDays===1?'day':'days')

        if (nrOfDays < 1){
            const nrOfHours = Math.floor(( time1 - time2 ) / (86400000/24))
            result = nrOfHours+' '+(nrOfHours===1?'hour':'hours')
        }
    }

    return result
}

export const markEpisodeAsWatched = async (seriesId, userId, seasonNr, episodeNr) => {

    // find out what index the episode in overall episode list has. start counting with 0.
    
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
