import React, { Component } from 'react'
import * as Sentry from '@sentry/browser'

export default class ErrorComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventId: props.eventId
    }
  }

  render() {
    return(
      <div>
        <p>Error has occurred in this component. The dev team has been notified. Press F5 to reload the page.</p>
        <p>If you want to further help me let me know what happened exactly:</p>
        <button onClick={() => Sentry.showReportDialog({ eventId: this.state.eventId })}>Report feedback</button>
      </div>
    )
  }
}
