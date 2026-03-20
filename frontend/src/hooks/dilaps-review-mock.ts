import type { DilapsSection } from "./dilaps-review-types"

export const MOCK_SECTIONS: DilapsSection[] = [
  {
    id: 1,
    name: "External Walls",
    sortOrder: 0,
    imageFileIds: [101, 102, 103],
    items: [
      {
        id: 1, itemNumber: "1.01", leaseClause: "4.2",
        wantOfRepair: "Cracking to external brickwork at ground floor level",
        remedy: "Cut out and repoint affected areas with matching mortar",
        unit: "m\u00B2", quantity: 12, rate: 45, cost: 540, sortOrder: 0,
      },
      {
        id: 2, itemNumber: "1.02", leaseClause: "4.2",
        wantOfRepair: "Failed pointing to window reveals",
        remedy: "Rake out and repoint with appropriate mortar mix",
        unit: "m", quantity: 8, rate: 25, cost: 200, sortOrder: 1,
      },
    ],
  },
  {
    id: 2,
    name: "Roof Covering",
    sortOrder: 1,
    imageFileIds: [104, 105],
    items: [
      {
        id: 3, itemNumber: "2.01", leaseClause: "4.1",
        wantOfRepair: "Slipped and missing roof tiles to front elevation",
        remedy: "Replace missing tiles and re-bed slipped tiles",
        unit: "No", quantity: 15, rate: 35, cost: 525, sortOrder: 0,
      },
      {
        id: 4, itemNumber: "2.02", leaseClause: "4.1",
        wantOfRepair: "Deteriorated lead flashing at abutment",
        remedy: "Strip and replace lead flashing with code 4 lead",
        unit: "m", quantity: 6, rate: 85, cost: 510, sortOrder: 1,
      },
      {
        id: 5, itemNumber: "2.03", leaseClause: "4.1",
        wantOfRepair: "Blocked guttering causing overflow",
        remedy: "Clear debris and test for adequate flow",
        unit: "Sum", quantity: 1, rate: 150, cost: 150, sortOrder: 2,
      },
    ],
  },
  {
    id: 3,
    name: "Internal Decorations",
    sortOrder: 2,
    imageFileIds: [106, 107, 108, 109],
    items: [
      {
        id: 6, itemNumber: "3.01", leaseClause: "4.5",
        wantOfRepair: "Stained and peeling ceiling decoration in main office",
        remedy: "Prepare, apply stain block and redecorate",
        unit: "m\u00B2", quantity: 25, rate: 18, cost: 450, sortOrder: 0,
      },
      {
        id: 7, itemNumber: "3.02", leaseClause: "4.5",
        wantOfRepair: "Scuffed and damaged wall finish throughout",
        remedy: "Prepare and redecorate all wall surfaces",
        unit: "m\u00B2", quantity: 80, rate: 14, cost: 1120, sortOrder: 1,
      },
    ],
  },
  {
    id: 4,
    name: "Flooring",
    sortOrder: 3,
    imageFileIds: [110],
    items: [
      {
        id: 8, itemNumber: "4.01", leaseClause: "4.6",
        wantOfRepair: "Worn and stained carpet tiles in reception",
        remedy: "Uplift and replace carpet tiles to match original specification",
        unit: "m\u00B2", quantity: 30, rate: 22, cost: 660, sortOrder: 0,
      },
      {
        id: 9, itemNumber: "4.02", leaseClause: "4.6",
        wantOfRepair: "Cracked vinyl flooring in kitchen area",
        remedy: "Strip and replace vinyl floor covering",
        unit: "m\u00B2", quantity: 10, rate: 35, cost: 350, sortOrder: 1,
      },
    ],
  },
]
