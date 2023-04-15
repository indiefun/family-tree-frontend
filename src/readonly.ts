const href = window.location.href
const url = new URL(href)

export const readonly = !!url.searchParams.get('readonly');
export default {
    readonly,
}
