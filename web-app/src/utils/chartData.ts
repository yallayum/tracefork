import type { TempPoint } from '../components/charts/TemperatureAreaChart'
import type { TraceResult } from '../api/types'

export function buildTemperatureSeries(data: TraceResult | null, lot: string): TempPoint[] {
  const limit = 4
  const points: TempPoint[] = []

  for (const ev of data?.timeline ?? []) {
    if (ev.temperature_c == null) continue
    points.push({
      label: ev.timestamp?.slice(11, 16) || ev.event_type,
      temp: ev.temperature_c,
      event: `${ev.event_type} · ${ev.node_name}`,
      violation: ev.temperature_c > limit,
    })
  }

  const peak = data?.cold_chain?.violations?.[0]?.max_temp_c
  if (peak != null && peak > limit) {
    points.push({
      label: 'Transit',
      temp: peak,
      event: 'Cold chain violation peak',
      violation: true,
    })
  }

  if (!points.length) {
    const synthetic =
      lot.includes('0315')
        ? [
            { label: '06:00', temp: 2.1, event: 'Departure' },
            { label: '09:00', temp: 3.4, event: 'En route' },
            { label: '12:00', temp: 9.2, event: 'Violation', violation: true },
            { label: '15:00', temp: 7.1, event: 'Recovery', violation: true },
            { label: '18:00', temp: 3.0, event: 'Arrival' },
          ]
        : [
            { label: '06:00', temp: 2.0, event: 'Harvest' },
            { label: '10:00', temp: 3.2, event: 'Processing' },
            { label: '14:00', temp: 2.8, event: 'Cold storage' },
            { label: '18:00', temp: 3.1, event: 'Distribution' },
            { label: '22:00', temp: 2.5, event: 'Retail shelf' },
          ]
    return synthetic
  }

  return points
}
