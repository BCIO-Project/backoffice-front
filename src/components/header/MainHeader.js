import React from 'react';
import { Header, Icon, Button } from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import './MainHeader.scss';
import Cookies from 'js-cookie';
import { withRouter } from 'react-router-dom' 

export class MainHeader extends React.Component{
  /**
   * remove cookie and logout user
   * @memberof MainHeader
   */
  logout(){
    Cookies.remove('auth')
    this.props.history.push('/')
  }
  
  render(){
    const logo = `${process.env.PUBLIC_URL}/images/max-logo1.svg`;
    const login = `${process.env.PUBLIC_URL}/images/icon-login.svg`;
    const buttons = this.props.buttons || [];
    const logoHidden = this.props.logoHidden || false;
    return(
        <header className={`main-header ${this.props.className}`}>
          <div className="common-header">
            <div className={`logo ${logoHidden ? 'logo_hidden': ''}`}>
              <Link to="/home">
                <img src={logo} alt="BCIO" />
              </Link>
            </div>
            <div className="profile">
              <Header as='h4' onClick={this.logout.bind(this)}>
              <img src={login} alt="login" />
                <Header.Content>Logout</Header.Content>
              </Header>
            </div>
          </div>
          <nav className="page-header">
            <div className="content">
              <Header as='h1'>
                {this.props.title}
              </Header>
              <div className="actions">
                {
                  buttons.map((button, index)=>(
                  <Button key={index} className={button.cls} name={button.name} onClick={button.action}> 
                      <Icon name={button.icon}/>
                      {button.title} 
                  </Button>
                  ))
                }
              </div>
            </div>
          </nav>
        </header>
    )
  }
}

export default withRouter(MainHeader)