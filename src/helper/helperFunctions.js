
export const seasonEpisodeNotation = (seasonNr, episodeNr) => {
    var season = seasonNr
    if (season < 10) season = '0'+season

    var episode = episodeNr
    if (episode < 10) episode = '0'+episode

    return 's'+season+'e'+episode
}

export const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window
    return {
        width,
        height
    }
}
