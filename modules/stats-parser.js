const http = require('http')
const parseString = require('xml2js').parseString

const parseStatsData = (data) => {
  let listeners = []
  parseString(data, (err, json) => {
    if (err) {
      console.error('E: ' + err);
      []
    }

    json.icestats.source.forEach((source) => {
      const name = source.$.mount
      const listenersCount = parseInt(source.listeners[0])

      listeners[name] = listenersCount
    })
  })
  return listeners
}

module.exports = {
  getStats: (podPool) => {
    let listeners = [];

    let password = 'hackme'

    if (process.env.ADMIN_PASSWORD) {
      password = process.env.ADMIN_PASSWORD
    }

    for (client in podPool) {
      const pods = podPool[client]
      for (podName in pods) {
        const pod = pods[podName]
        http.get({
          host: pod.ip,
          port: 8000,
          path: '/admin/stats',
          headers: {
            'Authorization': 'Basic ' + new Buffer('admin:' + password).toString('base64')
          }
        }, (response) => {
          var body = ''
          response.on('data', function(d) {
            body += d
          });
          response.on('end', function() {
            const podListeners = parseStatsData(body)

            podListeners.forEach((count, source) => {
              if (listeners[source] !== undefined) {
                listeners[source] = count
              } else {
                listeners[source] += count
              }
            })
          })
        })
      }
    }

    console.log(listeners)
  }
}
