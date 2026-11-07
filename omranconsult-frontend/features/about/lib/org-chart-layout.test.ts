import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { layoutOrgChart } from "./org-chart-layout.ts";

describe("layoutOrgChart", () => {
  it("groups column nodes without surfacing raw group keys as headings", () => {
    const layout = layoutOrgChart([
      { id: 1, parentId: null, group: "board", title: "Chair" },
      { id: 2, parentId: null, group: "board", title: "CEO" },
      { id: 3, parentId: null, group: "projects", title: "PM" },
    ]);

    assert.equal(layout.top?.title, "Chair");
    assert.equal(layout.boardRow.length, 1);
    assert.equal(layout.columns.length, 1);
    assert.equal(layout.columns[0]?.group, "projects");
  });
});
