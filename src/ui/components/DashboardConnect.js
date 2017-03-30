import React from 'react';
import Router from 'react-router';

import accountStore from '../stores/AccountStore';
import ServerStore from '../stores/ServerStore';
import VPN from '../actions/VPNActions';
import Select from 'react-select';
import _ from 'lodash';
import LogActions from '../actions/LogActions';
import ServerOption from './ServerListOption';
import ServerItem from './ServerListItem';
import Logs from './Logs';
import config from '../../config';
import Credentials from '../utils/CredentialsUtil';
import T from 'i18n-react';

var DashboardConnect = React.createClass({
    getInitialState: function () {
        const { servers } = ServerStore.getState();

        return {
            connecting: accountStore.getState().connecting,
            appReady: accountStore.getState().appReady,
            username: Credentials.get().username,
            password: Credentials.get().password,
            saveCredentials: config.get('saveCredentials'),
            server: config.get('server') || 'hub.vpn.ht',
            servers
        };
    },

    componentDidMount: function () {
        ServerStore.listen( ({servers}) => {
            servers = servers.map( item => {
                const { name, ip, country } = item;

                return {
                    label: name,
                    value: ip,
                    country
                };
            });

            this.setState({ servers });
        });

        accountStore.listen(this.update);
    },

    componentWillUnmount: function () {
        accountStore.unlisten(this.update);
    },

    update: function () {
        if (this.isMounted()) {
            this.setState({
                connecting: accountStore.getState().connecting,
                appReady: accountStore.getState().appReady
            });
        }
    },

    updateServers: function () {
        if (this.isMounted()) {
            this.setState({
                servers: serverStore.getState().servers
            });
        }
    },

    handleChange: function (key) {
        return function (e) {
            var state = {};
            state[key] = e.target.value;
            this.setState(state);
        }.bind(this);
    },

    handleConnect: function (e) {
        e.preventDefault();

        if (this.state.connecting) {
            VPN.disconnect();
        } else {
            if (!this.state.username) {
                    alert(T.translate('Username should not be left blank'));
            } else if (!this.state.password) {
                    alert(T.translate('Password should not be left blank'));
            } else if (!this.state.server) {
                    alert(T.translate('You should select a server'));
            } else {

                // should we save credentials ?
                if (this.state.saveCredentials) {
                    Credentials.save(this.state.username, this.state.password);
                } else {
                    // make sure to flush previous save
                    Credentials.logout();
                }

                VPN.connect(this.state);
            }
        }
    },

    handleServer: function (val) {
        this.setState({
            server: val
        });

        // save for future use
        config.set('server', val, val.value);
    },

    handleChangeSaveCredentials: function (e) {
        var checked = e.target.checked;
        this.setState({
            saveCredentials: checked
        });

        // clear username/pw
        if (!checked) {
            Credentials.logout();
            this.setState({
                username: '',
                password: ''
            });
        }

        // save for future use
        config.set('saveCredentials', !!checked);
    },

    handleKeyPress: function (e) {
        if (e.key === 'Enter') {
            this.handleConnect(e);
        }
    },

    render: function () {
        var currentStatus = T.translate('Loading...');

        if (this.state.appReady) {
            if (this.state.connecting) {
                    currentStatus = T.translate('Connecting...');
            }
            else {
                    currentStatus = T.translate('Disconnected');
            }
        }

        return (
            <div>

                <section>
                    <h1 className="title">{T.translate('VPN connection status')}</h1>
                    <div className="connectionstatus">
                        <i className={this.state.connecting ? 'ion-ios-loop spin' : 'ion-ios-close-empty disconnected'}></i>
                        <p>{currentStatus}</p>
                    </div>
                    <button disabled={!this.state.appReady} className="right" onClick={this.handleConnect}>
                        <p>{this.state.connecting ? T.translate('cancel') : T.translate('connect to vpn')}</p>
                    </button>
                </section>

                <section>
                    <h1 className="title">{T.translate('Login')}</h1>
                    <input name="username" disabled={!this.state.appReady} value={this.state.username || ''} onChange={this.handleChange('username')} placeholder={T.translate('Username')} type="text" />
                    <input name="password" disabled={!this.state.appReady} value={this.state.password || ''} onChange={this.handleChange('password')} onKeyPress={this.handleKeyPress} placeholder={T.translate('Password')} type="password" />
                    <div className="checkbox">
                        <input type="checkbox" disabled={!this.state.appReady} checked={this.state.saveCredentials} onChange={this.handleChangeSaveCredentials} id="saveCredentials" />
                        <label htmlFor="saveCredentials">
                            <p>{T.translate('Remember my username and password')}</p>
                        </label>
                    </div>
                </section>

                <section>
                    <h1 className="title">{T.translate('Servers')}</h1>
                    <Select
                        disabled={!this.state.appReady}
                        name="server"
                        value={this.state.server}
                        options={this.state.servers}
                        onChange={this.handleServer}
                        placeholder={T.translate('Select server')}
                        optionComponent={ServerOption}
                        valueComponent={ServerItem}
                        searchable={false}
                        clearable={false}
                    />
                </section>

                <Logs />
            </div>
        );
    }

});

module.exports = DashboardConnect;