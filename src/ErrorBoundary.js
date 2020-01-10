import React, { Component } from 'react'
import * as Sentry from '@sentry/browser'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, eventId: null }
  }

  componentDidCatch(err, info) {
    this.setState({ hasError: true })
    const eventId = Sentry.captureException(err);
    this.setState({eventId})
  }

  render() {
    if (this.state.hasError) {
      return <button onClick={() => Sentry.showReportDialog({ eventId: this.state.eventId })}>Report feedback</button>;
    }
    return this.props.children;
  }
}