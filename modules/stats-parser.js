const http = require('http')

module.exports = {
  getStats: (podPool) => {
    let password = 'hackme'

    if(process.env.ADMIN_PASSWORD) {
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
            console.log(body)
          })
        })
      }
    }
  }
}
