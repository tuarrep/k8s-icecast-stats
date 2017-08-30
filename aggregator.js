const k8s = require('./modules/k8s')
const podPool = require('./modules/pod-pool')
const statsParser = require('./modules/stats-parser')

const config = require('./config')

k8s.getIcecastPods(config.k8s.namespace, podPool.handlePodsEvents);

setInterval(() => {
  statsParser.getStats(podPool.getPool())
}, 5000)
