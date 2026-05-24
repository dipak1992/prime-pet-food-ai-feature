export function getGreeting(date = new Date()): {
  greeting: string
  timeString: string
  contextMessage: string
} {
  const hour = date.getHours()
  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  let greeting = 'Hello'
  let contextMessage = ''

  if (hour < 12) {
    greeting = 'Good morning'
    contextMessage = 'Plan your day ahead'
  } else if (hour < 17) {
    greeting = 'Good afternoon'
    contextMessage = 'Starting to think about dinner?'
  } else if (hour < 21) {
    greeting = 'Good evening'
    contextMessage = 'dinner in ~30 min'
  } else {
    greeting = 'Good evening'
    contextMessage = 'Planning for tomorrow?'
  }

  return { greeting, timeString, contextMessage }
}
