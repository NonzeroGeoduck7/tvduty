const Sentry = require('@sentry/browser');

export const handleErrors = (response) => {
    if (!response.ok) {
        throw Error(response);
    }
    return response;
}

export async function reportError(error) {
    console.warn(error)

    var eventId = null
    if (typeof error === 'string') {
        eventId = Sentry.captureMessage(error)
    } else {
        eventId = Sentry.captureException(error)
    }

    await Sentry.flush()
    return eventId
}
