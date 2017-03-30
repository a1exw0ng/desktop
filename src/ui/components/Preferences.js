import React from 'react';
import metrics from '../utils/MetricsUtil';
import Router from 'react-router';
import Select from 'react-select';
import VPN from '../utils/VPNUtil';
import config from '../../config';
import T from 'i18n-react';

var Preferences = React.createClass({
    getInitialState: function() {
        return {
            metricsEnabled: metrics.enabled(),
            launchStartup: config.get('launchStartup'),
            launchStartupHidden: config.get('launchStartupHidden'),
            connectLaunch: config.get('connectLaunch'),
            saveCredentials: config.get('saveCredentials'),
            autoPath: config.get('autoPath'),
            disableSmartdns: config.get('disableSmartdns'),
            encryption: config.get('encryption') || 128,
            customPort: config.get('customPort') || 'default',
            minToTaskbar: config.get('minToTaskbar')
        };
    },

    handleChangeMetricsEnabled: function(e) {
        var checked = e.target.checked;
        this.setState({
            metricsEnabled: checked
        });
        metrics.setEnabled(checked);
        metrics.track('Toggled util/MetricsUtil', {
            enabled: checked
        });
    },

    handleChangeLaunchStartup: function(e) {

        var checked = e.target.checked;
        this.setState({
            launchStartup: checked
        });

        if (checked) {
            VPN.enableStartOnBoot(this.state.launchStartupHidden);
        } else {
            VPN.disableStartOnBoot();
        }

        // save for future use
        config.set('launchStartup', checked);

    },


    handleChangeLaunchStartupHidden: function(e) {

        var checked = e.target.checked;
        this.setState({
            launchStartupHidden: checked
        });

        if (checked) {
            VPN.enableStartOnBoot(true);
        } else {
            VPN.disableStartOnBoot();
        }

        // save for future use
        config.set('launchStartupHidden', checked);

    },

    handleChangeDisableSmartdns: function(e) {

        var checked = e.target.checked;
        this.setState({
            disableSmartdns: checked
        });

        // save for future use
        config.set('disableSmartdns', checked);

    },

    handleChangeMinToTaskbar: function(e) {

        var checked = e.target.checked;
        this.setState({
            minToTaskbar: checked
        });

        // save for future use
        config.set('minToTaskbar', checked);

    },


    handleChangeConnectLaunch: function(e) {

        var checked = e.target.checked;
        this.setState({
            connectLaunch: checked
        });

        // save for future use
        config.set('connectLaunch', checked);

    },

    handleChangeAutoPath: function(e) {

        var checked = e.target.checked;
        this.setState({
            autoPath: checked
        });

        // 64b not available with autoPath
        if (this.state.encryption == 64) {
            this.handleEncryptionChange(128);
        }

        // save for future use
        config.set('autoPath', checked);

    },

    handleEncryptionChange: function(encryption) {

        this.setState({
            encryption: encryption.value
        });
        this.handlePortChange({value:'default'});
        config.set('encryption', encryption.value);

    },

    handlePortChange: function(customPort) {

        this.setState({
            customPort: customPort.value
        });
        config.set('customPort', customPort.value);

    },



    render: function() {


        var encryptions;
        var ports;

        if (this.state.autoPath) {
            encryptions = [{
                value: 128,
                label: '128 BIT AES'
            }, {
                value: 256,
                label: '256 BIT AES'
            }];
        } else {
            encryptions = [{
                value: 64,
                label: '64 BIT BLOWFISH'
            }, {
                value: 128,
                label: '128 BIT AES'
            }, {
                value: 256,
                label: '256 BIT AES'
            }];
        }

        if (this.state.encryption == 64) {
            ports = [{
                value: 'default',
                label: 'UDP - ' + T.translate('Default')
            }];
        } else if (this.state.encryption == 128) {
            ports = [{
                value: 'default',
                label: 'UDP - ' + T.translate('Default')
            }, {
                value: 53,
                label: 'UDP - 53'
            }, {
                value: 443,
                label: 'TCP - 443'
            }, {
                value: 80,
                label: 'TCP - 80'
            }];
        } else if (this.state.encryption == 256) {
            ports = [{
                value: 'default',
                label: 'UDP - ' + T.translate('Default')
            }, {
                value: 3389,
                label: 'UDP - 3389'
            }];
        }


        var customPort = "";
        if (!this.state.autoPath) {
            customPort = (
                <section className="preferences">
                    <h1 className="title">{T.translate('Custom Port')}</h1>
                    <div className="selectbox">
                        <Select
                            name="customPort"
                            value={this.state.customPort}
                            options={ports}
                            onChange={this.handlePortChange}
                            searchable={false}
                            clearable={false}
                        />
                    </div>
                </section>
            );
        }

        return (
            <div className="content-scroller" id="content">
                <section>
                        <h1 className="title">{T.translate('General')}</h1>
                        <div className="checkbox">
                            <input id="reportAnon" type="checkbox" checked={this.state.metricsEnabled} onChange={this.handleChangeMetricsEnabled}/>
                            <label htmlFor="reportAnon">
                                <p>{T.translate('Report anonymous usage analytics')}</p>
                            </label>
                        </div>
                        <div className="checkbox">
                            <input id="saveCredentials" disabled={!this.state.saveCredentials}  type="checkbox" checked={this.state.connectLaunch && this.state.saveCredentials} onChange={this.handleChangeConnectLaunch}/>
                            <label htmlFor="saveCredentials">
                                <p>{T.translate('Auto-connect after launch (requires a saved user/pass)')}</p>
                            </label>
                        </div>
                        <div className="checkbox">
                            <input id="launchStartup" type="checkbox" checked={this.state.launchStartup} onChange={this.handleChangeLaunchStartup}/>
                            <label htmlFor="launchStartup">
                                <p>{T.translate('Launch on operating system startup')}</p>
                            </label>
                        </div>
                        <div className="checkbox">
                            <input id="launchStartupHidden" type="checkbox" checked={this.state.launchStartupHidden} onChange={this.handleChangeLaunchStartupHidden}/>
                            <label htmlFor="launchStartupHidden">
                                <p>{T.translate('Launch on operating system startup hidden')}</p>
                            </label>
                        </div>
                        <div className="checkbox">
                            <input id="disableSmartdns" type="checkbox" checked={this.state.disableSmartdns} onChange={this.handleChangeDisableSmartdns}/>
                            <label htmlFor="disableSmartdns">
                                <p>{T.translate('Disable SmartDNS')}</p>
                            </label>
                        </div>
                        <div className="checkbox">
                            <input id="minToTaskbar" type="checkbox" checked={this.state.minToTaskbar} onChange={this.handleChangeMinToTaskbar}/>
                            <label htmlFor="minToTaskbar">
                                <p>{T.translate('Minimize to taskbar')}</p>
                            </label>
                        </div>
                </section>
                <section className="preferences">
                    <h1 className="title">{T.translate('Encryption')}</h1>
                    <div className="selectbox">
                        <Select
                            name="encryption"
                            value={this.state.encryption}
                            options={encryptions}
                            onChange={this.handleEncryptionChange}
                            searchable={false}
                            clearable={false}
                        />
                    </div>
                </section>
                {customPort}
                <section className="preferences">
                    <h1 className="title">{T.translate('Auto Path')}</h1>
                    <div className="checkbox">
                        <input type="checkbox" id="autopath" checked={this.state.autoPath} onChange={this.handleChangeAutoPath} />
                        <label htmlFor="autopath">
                            <p>{this.state.autoPath ? T.translate('Enabled') : T.translate('Disabled')}</p>
                        </label>
                        <p className="info">{T.translate('Feature that tries alternate ports in order to resolve certain types of connections issues.')}</p>
                    </div>
                </section>
            </div>

        );
    }
});

module.exports = Preferences;