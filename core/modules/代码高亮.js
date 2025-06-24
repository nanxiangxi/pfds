export function initHighlight() {
    import('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js')
        .then(() => {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        });
}
