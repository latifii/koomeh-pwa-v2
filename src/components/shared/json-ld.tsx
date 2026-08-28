/**
 * Renders a schema.org graph into the page.
 *
 * Server-only by nature — it emits a script tag with no behaviour, so it never
 * needs to reach the client bundle. Values are serialised with `JSON.stringify`
 * and the `<` escaped, so a listing description containing `</script>` cannot
 * close the tag and inject markup.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // `<` is a valid JSON escape for `<`, so the document still parses
      // as the same data while no `</script>` can survive in the output.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
