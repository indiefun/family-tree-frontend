const href = window.location.href
const url = new URL(href)

const focus: string = url.searchParams.get('focus') ?? ''
export default focus
