/**
 * Renders a schema.org graph into the page.
 *
 * Server-only by nature — it emits a script tag with no behaviour, so it never
 * needs to reach the client bundle. Values are serialised with `JSON.stringify`
 * and the `<` escaped, so a listing description containing `</script>` cannot
 * close the tag and inject markup.
 */
export function JsonLd({ data }: { data: object | null }) {
  // A schema builder returns null when the page has nothing to describe —
  // an empty FAQ, a branch with no address. Emitting an empty graph would be
  // worse than emitting none.
  if (!data) return null;

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
