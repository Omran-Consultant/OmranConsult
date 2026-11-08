import assert from "node:assert/strict";
import test from "node:test";

import { serializeJsonLd } from "./json-ld-serializer.ts";

test("renders a script-closing payload as inert JSON-LD text", () => {
  const serialized = serializeJsonLd({
    name: "</script><script>alert(1)</script>",
    separators: "&\u2028\u2029",
  });

  assert.equal(
    serialized,
    '{"name":"\\u003C/script\\u003E\\u003Cscript\\u003Ealert(1)\\u003C/script\\u003E","separators":"\\u0026\\u2028\\u2029"}',
  );
  assert.equal(serialized.includes("</script>"), false);
});
