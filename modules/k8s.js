const k8s = require('k8s')
const fs = require('fs')

let kubeapi = null

module.exports = {
  init: (config) => {
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

    kubeapi = k8s.api(apiConfig)
  },
  getIcecastPods: (namespace, callback) => {
    if(kubeapi == null) {
      console.error('E: K8s client isn\'t defined! Did you forgot to call init()? ')
      process.exit(2)
    }
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
