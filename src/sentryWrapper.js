const Sentry = require('@sentry/node');

const { SENTRY_DSN } = process.env;

let sentryInitialized = false;

export function initSentry() {
    if (SENTRY_DSN) {
        Sentry.init({ dsn: SENTRY_DSN });
        sentryInitialized = true;
    }
}

export async function reportError(error) {
    console.warn(error);
    if (!sentryInitialized){
        console.log("sentry not initialized, returning")
        return;
    }

    if (typeof error === 'string') {
        Sentry.captureMessage(error);
    } else {
        Sentry.captureException(error);
    }

    await Sentry.flush();
}

export function catchErrors(handler) {
    return async function(event, context) {
        context.callbackWaitsForEmptyEventLoop = false;
        try {
            return await handler.call(this, ...arguments);
        } catch(e) {
            // This catches both sync errors & promise
            // rejections, because we 'await' on the handler
            await reportError(e);
            return {
                statusCode: 500,
                body: String(e)
            }
        }
    };
}