const fs = require('fs')

const k8s = require('./modules/k8s')
const podPool = require('./modules/pod-pool')
const statsParser = require('./modules/stats-parser')

const buildConfig = () => {
  let config = {}

  if (fs.existsSync('./config.json')) {
    config = require('./config')
    console.log(config)
  } else {
    console.log('I: Config file not found. Trying to build config from env vars')
  }

  if (config.k8s == undefined) {
    config.k8s = {}
  }

  if (process.env.MONITOR_NAMESPACE) {
    config.k8s.namespace = process.env.MONITOR_NAMESPACE
  } else if (config.k8s.namespace == undefined) {
    config.k8s.namespace = 'default'
  }

  if (process.env.IN_CLUSTER) {
    config.k8s.inCluster = process.env.IN_CLUSTER == 'true' ? true : false
  } else if (config.k8s.inCluster == undefined) {
    console.error('E: I need to know if I\'m in a K8s cluster or not. Neither IN_CLUSTER env var nor config.k8s.inCluster is defined. Aborting')
    return false;
  }

  if (config.k8s.apiConfig == undefined) {
    config.k8s.apiConfig = {}
  }

  if (process.env.API_ENDPOINT) {
    config.k8s.apiConfig.endpoint = process.env.API_ENDPOINT
  } else if (config.k8s.apiConfig.endpoint == undefined) {
    config.k8s.apiConfig.endpoint = config.k8s.inCluster ? 'https://' + process.env.KUBERNETES_SERVICE_HOST + ':' + process.env.KUBERNETES_PORT_443_TCP_PORT : 'http://localhost:8001'
  }

  if (process.env.API_VERSION) {
    config.k8s.apiConfig.version = process.env.API_VERSION
  } else if (config.k8s.apiConfig.version == undefined) {
    config.k8s.apiConfig.version = '/api/v1'
  }

  if (process.env.STRICT_SSL) {
    config.k8.apiConfig.strictSSL = process.env.STRICT_SSL == 'true' ? true: false
  } else if (config.k8s.apiConfig.strictSSL == undefined) {
    config.k8s.apiConfig.strictSSL = false
  }

  return config
}

const config = buildConfig()

if (!config) {
  process.exit(1)
}

k8s.init(config)

k8s.getIcecastPods(config.k8s.namespace, podPool.handlePodsEvents)

setInterval(() => {
  statsParser.getStats(podPool.getPool())
}, 5000)
