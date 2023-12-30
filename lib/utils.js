export function chompLeft(s, format) {
    if (!s.startsWith(format)) return null;
    return s.substring(format.length);
}
