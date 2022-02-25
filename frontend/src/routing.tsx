import React from 'react'
import Auth from './auth/Auth'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Callback from './components/Callback'
import App from './App';
const auth = new Auth(history)

const handleAuthentication = (props: any) => {
  const location = props.location
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication()
  }
}

export const makeAuthRouting = () => {
  return (
    <Router>
      <div>
        <Route
          path="/callback"
          render={props => {
            handleAuthentication(props)
            return <Callback />
          }}
        />
        <Route
          render={props => {
            return <App auth={auth} {...props} />
          }}
        />
        {/* <Route path="/" render={(props) => <App auth={auth} {...props} />} />
          <Route path="/home" render={(props) => <Home auth={auth} {...props} />} /> */}
      </div>
    </Router>
  )
}
