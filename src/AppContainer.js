import React from "react"
import { withRouter } from 'react-router-dom'

class App extends React.Component {

    componentWillMount() {
      this.unlisten = this.props.history.listen((location, action) => {
        console.log("Navigate to route: "+location.pathname);
      });
    }
    componentWillUnmount() {
        this.unlisten();
    }
    render() {
       return (
           <div>{this.props.children}</div>
        );
    }
  }
  export default withRouter(App);
