const k8s = require('k8s')
const fs = require('fs')
const config = require('../config')

let apiConfig = config.k8s.apiConfig;
let auth = {}

if (config.k8s.inCluster) {
  auth = {
    token: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token')
  }
} else {
  auth = {
    clientKey: fs.readFileSync('keys/apiserver.key'),
    clientCert: fs.readFileSync('keys/apiserver.crt'),
    caCert: fs.readFileSync('keys/ca.crt')
  }
}

apiConfig.auth = auth

const kubeapi = k8s.api(apiConfig)

module.exports = {
  getIcecastPods: (namespace, callback) => {
    kubeapi.watch('watch/namespaces/' + namespace + '/pods').subscribe(
      data => {
        callback(false, data)
      },
      err => {
        callback(err, null)
      }
    )
  }
}
