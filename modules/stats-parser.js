const http = require('http')

module.exports = {
  getStats: (podPool) => {
    for(client in podPool) {
      const pods = podPool[client]
      for (podName in pods) {
        const pod = pods[podName]
        console.log(pod)
      }
    }
  }
}
