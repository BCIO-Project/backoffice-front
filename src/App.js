import React from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import CreateCampaign from './pages/createCampaign/CreateCampaign';
import ModifyCampaign from './pages/modifyCampaign/ModifyCampaign';
import Home from './pages/home/Home';
import Scheduler from './pages/scheduler/Scheduler';
import Login from './pages/login/Login';
import Auth from './services/auth.service';
const App = () => {
  return (
    <Router >
      <Switch>
        <Route path="/" exact component={Login} />
        <Auth path="/home/:id?" component={Home} />
        <Auth path="/create-campaign" component={CreateCampaign} />
        <Auth path="/modify-campaign/:id" component={ModifyCampaign} />
        <Auth path="/calendar" component={Scheduler} />
      </Switch>
    </Router>
  );
}

export default App;
