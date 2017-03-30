import fs from 'fs';
import LogActions from '../actions/LogActions';
import vpnActions from '../actions/VPNActions';
import getPort from 'get-port';
import openvpnmanager from 'node-openvpn';
import util from './Util';
import path from 'path';
import running from 'is-running';

var openvpn;

module.exports = {

    managementPort: function() {
        return getPort().then(port => {
            fs.writeFileSync(path.join(util.supportDir(), 'openvpn.port'), port);
            return port;
        });
    },

    softKill: function(port) {

        var opts = {
            host: 'localhost',
            port: port,
            timeout: 1500
        };

        LogActions.addInfo( 'VPNUtil.softDisconnect - Trying to stop previous process');

        return new Promise((resolve, reject) => {

            openvpn = openvpnmanager.connectAndKill(opts);

            // we wait the connection to close
            openvpn.on('state-change', function(state) {
                if (state && state[2] == 'exit-with-notification') {
                    openvpnmanager.destroy();
                    openvpn.removeAllListeners();
                    resolve();
                }
            });

            openvpn.on('error', function() {
                openvpnmanager.destroy();
                openvpn.removeAllListeners();
                reject();
            });

            openvpn.on('console-output', function(output) {
                log.info(output);
            });

        });

    },

    updateIp: function() {
        return new Promise((resolve, reject) => {
            // TODO: Add IP retrieval
        });
    },

    checkRunning: function() {
        return new Promise((resolve, reject) => {
            var pid = false;
            try {
                pid = fs.readFileSync(path.join(util.supportDir(), 'openvpn.pid')) || false;
            } catch (err) {}

            if (pid && running(Number(pid))) {
                LogActions.addInfo( 'Previous openvpn status still running, PID: ' + pid);
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

}