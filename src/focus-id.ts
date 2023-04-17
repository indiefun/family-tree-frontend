const href = window.location.href
const url = new URL(href)

export function focus() {
    return url.searchParams.get('focus') ?? ''
}
export default focus
