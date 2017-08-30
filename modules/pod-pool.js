let pool = []

module.exports = {
  handlePodsEvents: (err, pod) => {
    if (err) {
      console.error(err)
      return
    }

    if (pod.object.metadata.labels.role === 'icecast-client') {
      if (pod.type === 'DELETED') {
        const client = pod.object.metadata.labels.client
        const name = pod.object.metadata.name
        delete podPool[client][name]

        return
      }

      if (pod.object.status.phase === 'Running') {
        const newPod = {
          name: pod.object.metadata.name,
          ip: pod.object.status.podIP,
          node: pod.object.spec.nodeName,
          client: pod.object.metadata.labels.client
        }

        if (pool[newPod.client] === undefined) {
          pool[newPod.client] = []
        }

        pool[newPod.client][newPod.name] = newPod
      }
    }

    return
  },
  getPool: () => pool
}
