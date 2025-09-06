import { useEffect, useState } from 'react'
import { getMemoryUsage, getNetworkInfo, performanceMonitor } from '../utils/performance'

const PerformanceMonitor = ({ show = false }) => {
  const [metrics, setMetrics] = useState({})
  const [memory, setMemory] = useState(null)
  const [network, setNetwork] = useState(null)

  useEffect(() => {
    if (!show) return

    const updateMetrics = () => {
      // Get performance metrics
      const performanceMetrics = performanceMonitor.getMetrics()
      setMetrics(performanceMetrics)

      // Get memory usage
      const memoryUsage = getMemoryUsage()
      setMemory(memoryUsage)

      // Get network info
      const networkInfo = getNetworkInfo()
      setNetwork(networkInfo)
    }

    // Update metrics immediately
    updateMetrics()

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000)

    return () => clearInterval(interval)
  }, [show])

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <h3 className="font-bold mb-2">Performance Monitor</h3>
      
      {/* Memory Usage */}
      {memory && (
        <div className="mb-2">
          <div className="text-green-400">Memory:</div>
          <div>Used: {memory.used}MB / {memory.total}MB</div>
          <div>Limit: {memory.limit}MB</div>
        </div>
      )}

      {/* Network Info */}
      {network && (
        <div className="mb-2">
          <div className="text-blue-400">Network:</div>
          <div>Type: {network.effectiveType}</div>
          <div>Downlink: {network.downlink}Mbps</div>
          <div>RTT: {network.rtt}ms</div>
          {network.saveData && <div className="text-yellow-400">Data Saver: ON</div>}
        </div>
      )}

      {/* Performance Metrics */}
      {metrics.length > 0 && (
        <div>
          <div className="text-purple-400">Metrics:</div>
          {metrics.map((metric, index) => (
            <div key={index}>
              {metric.name}: {Math.round(metric.duration)}ms
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PerformanceMonitor
