import React from 'react';
import Switch from "react-switch";
import Bowser from "bowser";
import SweetAlert from 'sweetalert2-react';
import RingLoader from 'react-spinners/RingLoader';
import './App.css';


const STATE_MAP = {
  true: 'start',
  false: 'stop'
}

class App extends React.Component {
  state = {
    local: false,
    dropbox: false,
    dropboxAccessToken: '',
    sharedMongoUrl: '',
    sharedGmailEmail: '',
    sharedGmailPassword: '',
    sharedRecipientEmail: '',
    interval: '',
    showAlert: false,
    alertMsg: '',
    backupStarted: false,
    hidePassword: 'password',
    localBackupPath: '',
    sharedDbName: ''
  }


  componentDidMount() {
    const bowser = Bowser.getParser(window.navigator.userAgent);
    const osName = bowser.getOSName();
    fetch(`/api/status?os=${encodeURIComponent(osName)}`)
      .then(res => res.json())
      .then(res => {
        const newState = {};
        res.data.forEach(config => {
          Object.keys(config).forEach(p => {
            newState[p] = config[p];
          });
        });
        if (!localStorage.getItem('localBackupPath')) {
          newState.localBackupPath = res.localBackupPath;
        }
        this.setState(newState);
      })
      .catch(err => console.log("err fetching status"));
    Object.keys(localStorage).forEach(p => {
      this.setState({ [p]: localStorage.getItem(p) });
    });
  }

  handleInputChange = e => {
    e.persist();
    this.setState({ [e.target.name]: e.target.value }, () => localStorage.setItem(e.target.name, e.target.value));
  }

  generateEnv(type) {
    let env = "";
    env += `MONGODB_URL=${this.state.sharedMongoUrl} `;
    env += `DATABASE_NAME=${this.state.sharedDbName} `;
    env += `GMAIL_EMAIL=${this.state.sharedGmailEmail} `;
    env += `GMAIL_PASSWORD=${this.state.sharedGmailPassword} `;
    env += `RECIPIENT_EMAIL=${this.state.sharedRecipientEmail} `;
    if (type === "dropbox") {
      env += `DROPBOX_ACCESS_TOKEN=${this.state[`${type}AccessToken`]}`;
    } else {
      env += `LOCAL_BACKUP_PATH=${this.state[`${type}BackupPath`]}`;
    }
    return env;
  }

  handleButtonChange = (newState, e, type) => {
    e.preventDefault();
    const { interval } = this.state;
    const mode = STATE_MAP[newState];
    let isCurrentFormValid = document.getElementById(type) && document.getElementById(type).checkValidity();
    isCurrentFormValid = isCurrentFormValid && document.getElementById('shared') && document.getElementById('shared').checkValidity();
    if ((mode === "start" && isCurrentFormValid) || mode === "stop") {
      const env = this.generateEnv(type);
      fetch(`/api/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ type, interval, env })
      })
        .then(res => res.json())
        .then(res => {
          console.log("yooooo", res);
          this.setState({ [type]: newState });
        })
        .catch(err => {
          console.log("err fetching status");
        });

    } else {
      document.getElementById(type) && document.getElementById(type).reportValidity();
      document.getElementById('shared') && document.getElementById('shared').reportValidity();
    }
  }

  handleSingleBackup = type => {
    const isCurrentFormValid = document.getElementById(type) && document.getElementById(type).checkValidity() && document.getElementById('shared') && document.getElementById('shared').checkValidity();
    if (isCurrentFormValid) {
      const env = this.generateEnv(type);
      this.setState({ backupStarted: true })
      fetch(`/api/single`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ type, env })
      })
        .then(res => res.json())
        .then(res => {
          console.log("yooooo", res);
          this.setState({ showAlert: true, alertMsg: 'Backup Successfully Completed!', backupStarted: false }, () => setTimeout(() => this.setState({ showAlert: false }), 500));
        })
        .catch(err => {
          console.log("err fetching status");
          this.setState({ showAlert: true, alertMsg: `Backup Failed: ${err}`, backupStarted: false }, () => setTimeout(() => this.setState({ showAlert: false }), 500));
        });
    } else {
      document.getElementById(type) &&
        document.getElementById(type).reportValidity();
        document.getElementById('shared') && document.getElementById('shared').reportValidity()
    }
  }

  togglePasswordType = type => {
    let state = this.state[type];
    if (state === 'text') {
      state = 'password';
    } else {
      state = 'text';
    }
    this.setState({ [type]: state })
  }

  render() {
    const { sharedMongoUrl, sharedGmailEmail, sharedGmailPassword, dropboxAccessToken, local, dropbox, interval, localBackupPath, showAlert, alertMsg, backupStarted, hidePassword, sharedRecipientEmail, sharedDbName } = this.state;
    const loaderCssOverride = {
      position: 'absolute',
      zIndex: '100',
      width: '150px',
      height: '150px',
      top: '50%',
      left: '50%',
      borderColor: 'red',
      margin: '-75px 0 0 -75px'
    }
    return (
      <div className="container">
          <SweetAlert
          show={showAlert}
          title={alertMsg}
          onConfirm={() => this.setState({ showAlert: false })}
          />
        <RingLoader
          css={loaderCssOverride}
          sizeUnit={"px"}
          size={150}
          color={'green'}
          loading={backupStarted}
        />
        <div className="row col-sm-12">
          <div className="col-sm-6">
            <h1>Local Backup</h1>
          </div>
          <div className="col-sm-6">
            <h1>Dropbox Backup</h1>
          </div>
        </div>

        <div className="row col-sm-12 mb-3">
          <div className="col-sm-6">
            <form id="local">
              <div>LOCAL_BACKUP_PATH: <input required name="localBackupPath" onChange={this.handleInputChange} value={localBackupPath} className="form-control" /></div>
            </form>
          </div>
          <div className="col-sm-6">
            <form id="dropbox">
              <div>DROPBOX_ACCESS_TOKEN: <input id="dropboxAccessToken" required name="dropboxAccessToken" onChange={this.handleInputChange} value={dropboxAccessToken} className="form-control" /></div>
            </form>
          </div>
        </div>

        <div className="row col-sm-12 mb-3">
          <div className="col-sm-12">
            <form id="shared">
              <div>MONGODB_URL: <input required name="sharedMongoUrl" onChange={this.handleInputChange} value={sharedMongoUrl} className="form-control" /></div>
              <div>DATABASE_NAME: <input required name="sharedDbName" onChange={this.handleInputChange} value={sharedDbName} className="form-control" /></div>
              <div>GMAIL_EMAIL: <input required type="email" name="sharedGmailEmail" onChange={this.handleInputChange} value={sharedGmailEmail} className="form-control" /></div>
              <div>GMAIL_PASSWORD:</div><div className='input-group'> <input type={hidePassword} required name="sharedGmailPassword" onChange={this.handleInputChange} value={sharedGmailPassword} className="form-control" /> <i onClick={() => this.togglePasswordType('hidePassword')} className="fa fa-eye input-group-addon"></i> </div>
              <div>RECIPIENT_EMAIL: <input required type="email" name="sharedRecipientEmail" onChange={this.handleInputChange} value={sharedRecipientEmail} className="form-control" /></div>
            </form>
            <div className="form-group">
              BACKUP FREQUENCY:
          <br />
              <select className='form-control' name="interval" value={interval} onChange={this.handleInputChange}>
                <option value={6}>Every 6 Hours</option>
                <option value={24}>Every 24 Hours</option>
                <option value={168}>Every 7 Days</option>
              </select>
            </div >
          </div>

        </div>

        <div className="row col-sm-12">
          <div className="col-sm-6">
            <label className="vertical-align">
              <span>Continuous Local Backup: </span>
              <Switch
                width={80}
                height={40}
                onChange={(v, e) => this.handleButtonChange(v, e, 'local')}
                checked={local}
                className="react-switch"
                />
            </label>
          </div>
          <div className="col-sm-6">
            <label className="vertical-align">
              <span>Continuous Dropbox Backup: </span>
              <Switch
                width={80}
                height={40}
                onChange={(v, e) => this.handleButtonChange(v, e, 'dropbox')}
                checked={dropbox}
                className="react-switch"
              />
            </label>
          </div>
        </div>

        <div className="row col-sm-12">
          <div className="col-sm-6">
            <button onClick={() => this.handleSingleBackup('local')} className="btn btn-primary">Backup Now</button>
          </div>
          <div className="col-sm-6">
            <button onClick={() => this.handleSingleBackup('dropbox')} className="btn btn-primary">Backup Now</button>
          </div>
        </div >

      </div >
    );
  }
}


export default App;
